import { useState, useEffect } from 'react'
import { CloseIcon, DownloadIcon, CheckIcon } from './Icons'
import { t } from '../utils/translations'
import {
  getAllSnapshots,
  getSnapshotCount,
  downloadSnapshot,
  downloadEntireVault,
  clearVault,
  formatActionType,
  formatSnapshotTime
} from '../services/backupVault'

// Custom icons for this component
const VaultIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const RestoreIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
)

const TrashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
)

const WarningIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

export function BackupVault({ isOpen, onClose, onRestore, settings }) {
  const [snapshots, setSnapshots] = useState([])
  const [snapshotCount, setSnapshotCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [hasDownloaded, setHasDownloaded] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const lang = settings?.language || 'en'

  useEffect(() => {
    if (isOpen) {
      loadSnapshots()
    }
  }, [isOpen])

  const loadSnapshots = async () => {
    setLoading(true)
    try {
      const all = await getAllSnapshots()
      const count = await getSnapshotCount()
      setSnapshots(all)
      setSnapshotCount(count)
    } catch (err) {
      console.error('Failed to load snapshots:', err)
    }
    setLoading(false)
  }

  const handleDownloadSnapshot = (snapshot) => {
    downloadSnapshot(snapshot)
    showStatus('Backup downloaded!')
  }

  const handleDownloadAll = async () => {
    await downloadEntireVault()
    setHasDownloaded(true)
    showStatus('Complete vault downloaded!')
  }

  const handleRestore = (snapshot) => {
    if (confirm('Restore this backup? This will replace all current data.')) {
      onRestore(snapshot.data)
      showStatus('Backup restored successfully!')
      setTimeout(() => onClose(), 1500)
    }
  }

  const handleDeleteVault = async () => {
    if (!hasDownloaded) {
      showStatus('You must download the vault first!')
      return
    }
    
    await clearVault()
    setSnapshots([])
    setSnapshotCount(0)
    setShowDeleteConfirm(false)
    setHasDownloaded(false)
    showStatus('Vault cleared')
  }

  const showStatus = (msg) => {
    setStatusMessage(msg)
    setTimeout(() => setStatusMessage(''), 3000)
  }

  const groupSnapshotsByDate = (snapshots) => {
    const groups = {}
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    snapshots.forEach(snapshot => {
      const date = new Date(snapshot.timestamp)
      const dateStr = date.toDateString()
      
      let label
      if (dateStr === today) label = 'Today'
      else if (dateStr === yesterday) label = 'Yesterday'
      else label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      
      if (!groups[label]) groups[label] = []
      groups[label].push(snapshot)
    })
    
    return groups
  }

  if (!isOpen) return null

  const groupedSnapshots = groupSnapshotsByDate(snapshots)

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content vault-modal">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2>
            <VaultIcon className="vault-header-icon" />
            Backup Vault
          </h2>
          <div></div>
        </div>

        {statusMessage && (
          <div className="vault-status">
            <CheckIcon className="vault-status-icon" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="vault-summary">
          <div className="vault-stat">
            <span className="vault-stat-value">{snapshotCount}</span>
            <span className="vault-stat-label">Snapshots</span>
          </div>
          {snapshots[0] && (
            <div className="vault-stat">
              <span className="vault-stat-value">{formatSnapshotTime(snapshots[0].timestamp)}</span>
              <span className="vault-stat-label">Last Backup</span>
            </div>
          )}
        </div>

        <div className="vault-info">
          <p>Every change automatically creates a backup snapshot. These backups persist even if you delete transactions or clear app data.</p>
        </div>

        {loading ? (
          <div className="vault-loading">Loading snapshots...</div>
        ) : snapshots.length === 0 ? (
          <div className="vault-empty">
            <VaultIcon className="vault-empty-icon" />
            <p>No backups yet</p>
            <span>Backups will appear here automatically</span>
          </div>
        ) : (
          <div className="vault-list">
            {Object.entries(groupedSnapshots).map(([dateLabel, dateSnapshots]) => (
              <div key={dateLabel} className="vault-date-group">
                <div className="vault-date-label">{dateLabel}</div>
                {dateSnapshots.map(snapshot => (
                  <div key={snapshot.id} className="vault-item">
                    <div className="vault-item-info">
                      <div className="vault-item-time">
                        {new Date(snapshot.timestamp).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="vault-item-meta">
                        <span className="vault-item-action">{formatActionType(snapshot.actionType)}</span>
                        <span className="vault-item-counts">
                          {snapshot.entryCount} entries • {snapshot.scheduleCount} services
                        </span>
                      </div>
                    </div>
                    <div className="vault-item-actions">
                      <button 
                        className="vault-action-btn restore"
                        onClick={() => handleRestore(snapshot)}
                        title="Restore this backup"
                      >
                        <RestoreIcon />
                      </button>
                      <button 
                        className="vault-action-btn download"
                        onClick={() => handleDownloadSnapshot(snapshot)}
                        title="Download this backup"
                      >
                        <DownloadIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {snapshots.length > 0 && (
          <div className="vault-footer">
            <button className="vault-btn primary" onClick={handleDownloadAll}>
              <DownloadIcon className="vault-btn-icon" />
              Download Entire Vault
            </button>
            
            {!showDeleteConfirm ? (
              <button 
                className="vault-btn danger" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                <TrashIcon className="vault-btn-icon" />
                Delete Vault
              </button>
            ) : (
              <div className="vault-delete-confirm">
                <div className="vault-delete-warning">
                  <WarningIcon className="vault-warning-icon" />
                  <div>
                    <strong>Delete all backups?</strong>
                    <p>You must download the vault first to continue.</p>
                  </div>
                </div>
                <div className="vault-delete-actions">
                  <button 
                    className="vault-btn cancel" 
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setHasDownloaded(false)
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`vault-btn confirm-delete ${hasDownloaded ? 'enabled' : 'disabled'}`}
                    onClick={handleDeleteVault}
                    disabled={!hasDownloaded}
                  >
                    {hasDownloaded ? 'Confirm Delete' : 'Download First'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
