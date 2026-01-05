import { useState } from 'react'
import { CloseIcon, EmailIcon, DownloadIcon, CheckIcon } from './Icons'
import { t } from '../utils/translations'

// Google Sheets icon
const SheetsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
    <path d="M7 7h4v2H7zm0 4h4v2H7zm0 4h4v2H7zm6-8h4v2h-4zm0 4h4v2h-4zm0 4h4v2h-4z"/>
  </svg>
)

// Google Drive icon
const DriveIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.71 3.5L1.15 15l4.58 7.5h13.54L23.85 15 17.29 3.5H7.71zm-.28 1.5h6.57l5.14 9H9.57l-5.14-9h3z"/>
  </svg>
)

export function BackupModal({ isOpen, onClose, entries, scheduledServices, settings, profile }) {
  const [backupStatus, setBackupStatus] = useState('')
  const [emailAddress, setEmailAddress] = useState(profile?.email || '')
  const lang = settings?.language || 'en'

  const generateBackupData = () => {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      entries: entries || [],
      scheduledServices: scheduledServices || [],
      settings: settings || {},
      profile: profile || {}
    }
  }

  const generateCSV = () => {
    const rows = [
      ['Type', 'Date', 'Amount', 'Category', 'Source', 'Payer Name', 'Payment Method', 'Notes']
    ]
    
    entries.forEach(entry => {
      rows.push([
        entry.type || 'income',
        entry.date,
        entry.amount,
        entry.category,
        entry.source,
        entry.payerName || '',
        entry.paymentMethod || '',
        entry.notes || ''
      ])
    })

    return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  }

  const generateScheduleCSV = () => {
    const rows = [
      ['Title', 'Date', 'Time', 'Category', 'Contact Name', 'Phone', 'Address', 'Notes']
    ]
    
    scheduledServices.forEach(service => {
      rows.push([
        service.title,
        service.date,
        service.time,
        service.category,
        service.contactName || '',
        service.contactPhone || '',
        service.address || '',
        service.notes || ''
      ])
    })

    return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  }

  // Open in Google Sheets
  const handleOpenInSheets = (type) => {
    const csv = type === 'entries' ? generateCSV() : generateScheduleCSV()
    const title = type === 'entries' ? 'Dakshina_Transactions' : 'Dakshina_Schedule'
    
    // Create a blob and upload approach - we'll use a data URI approach
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    // Download first, then user can open in Sheets
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    // Open Google Sheets import page
    setTimeout(() => {
      window.open('https://sheets.google.com/create', '_blank')
    }, 500)
    
    setBackupStatus(t('csvDownloaded', lang) || 'CSV downloaded! Import it in the new Google Sheet')
    setTimeout(() => setBackupStatus(''), 4000)
  }

  // Save to Google Drive (download + open Drive)
  const handleSaveToDrive = () => {
    const data = generateBackupData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `dakshina-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    // Open Google Drive
    setTimeout(() => {
      window.open('https://drive.google.com/drive/my-drive', '_blank')
    }, 500)
    
    setBackupStatus(t('backupDownloaded', lang) || 'Backup downloaded! Upload it to your Google Drive')
    setTimeout(() => setBackupStatus(''), 4000)
  }

  // Email backup
  const handleEmailBackup = () => {
    if (!emailAddress) {
      setBackupStatus(t('enterEmail', lang) || 'Please enter your email address')
      setTimeout(() => setBackupStatus(''), 3000)
      return
    }

    const data = generateBackupData()
    const jsonStr = JSON.stringify(data, null, 2)
    
    // Create summary for email body
    const totalIncome = entries.filter(e => e.type !== 'expense').reduce((sum, e) => sum + e.amount, 0)
    const totalExpenses = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
    
    const subject = encodeURIComponent(`Dakshina Backup - ${new Date().toLocaleDateString()}`)
    const body = encodeURIComponent(`
Dakshina Backup
=============================
Date: ${new Date().toLocaleString()}

Summary:
- Total Entries: ${entries.length}
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net Income: $${(totalIncome - totalExpenses).toFixed(2)}
- Scheduled Services: ${scheduledServices.length}

To restore this backup:
1. Download the attached JSON file
2. Open Dakshina app
3. Go to Settings > Restore Backup
4. Select the downloaded file

---
BACKUP DATA (copy everything below this line):
---

${jsonStr}
    `.trim())

    // Open Gmail compose with the data
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${subject}&body=${body}`, '_blank')
    
    setBackupStatus(t('emailOpened', lang) || 'Gmail opened! Send the email to save your backup')
    setTimeout(() => setBackupStatus(''), 4000)
  }

  // Download local backup
  const handleLocalBackup = () => {
    const data = generateBackupData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `dakshina-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    setBackupStatus(t('backupSaved', lang) || 'Backup saved to your device!')
    setTimeout(() => setBackupStatus(''), 3000)
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2>{t('backupData', lang) || 'Backup Data'}</h2>
          <div></div>
        </div>

        {backupStatus && (
          <div className="backup-status">
            <CheckIcon className="backup-status-icon" />
            <span>{backupStatus}</span>
          </div>
        )}

        <div className="backup-section">
          <h3 className="backup-section-title">{t('googleSheets', lang) || 'Google Sheets'}</h3>
          <p className="backup-section-desc">{t('googleSheetsDesc', lang) || 'Export your data as spreadsheets'}</p>
          
          <div className="backup-buttons">
            <button className="backup-btn sheets" onClick={() => handleOpenInSheets('entries')}>
              <SheetsIcon className="backup-btn-icon" />
              <div className="backup-btn-text">
                <span className="backup-btn-title">{t('exportTransactions', lang) || 'Transactions'}</span>
                <span className="backup-btn-sub">{entries.length} {t('entries', lang) || 'entries'}</span>
              </div>
            </button>
            
            <button className="backup-btn sheets" onClick={() => handleOpenInSheets('schedule')}>
              <SheetsIcon className="backup-btn-icon" />
              <div className="backup-btn-text">
                <span className="backup-btn-title">{t('exportSchedule', lang) || 'Schedule'}</span>
                <span className="backup-btn-sub">{scheduledServices.length} {t('services', lang) || 'services'}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="backup-section">
          <h3 className="backup-section-title">{t('googleDrive', lang) || 'Google Drive'}</h3>
          <p className="backup-section-desc">{t('googleDriveDesc', lang) || 'Save complete backup to your Drive'}</p>
          
          <button className="backup-btn drive" onClick={handleSaveToDrive}>
            <DriveIcon className="backup-btn-icon" />
            <div className="backup-btn-text">
              <span className="backup-btn-title">{t('saveToDrive', lang) || 'Save to Drive'}</span>
              <span className="backup-btn-sub">{t('fullBackup', lang) || 'Full backup with all data'}</span>
            </div>
          </button>
        </div>

        <div className="backup-section">
          <h3 className="backup-section-title">{t('emailBackup', lang) || 'Email Backup'}</h3>
          <p className="backup-section-desc">{t('emailBackupDesc', lang) || 'Send backup to your Gmail'}</p>
          
          <div className="backup-email-input">
            <EmailIcon className="backup-email-icon" />
            <input
              type="email"
              placeholder={t('yourEmail', lang) || 'your@email.com'}
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>
          
          <button className="backup-btn email" onClick={handleEmailBackup}>
            <EmailIcon className="backup-btn-icon" />
            <div className="backup-btn-text">
              <span className="backup-btn-title">{t('sendToEmail', lang) || 'Send to Email'}</span>
              <span className="backup-btn-sub">{t('openGmail', lang) || 'Opens Gmail to send'}</span>
            </div>
          </button>
        </div>

        <div className="backup-section">
          <h3 className="backup-section-title">{t('localBackup', lang) || 'Local Backup'}</h3>
          
          <button className="backup-btn local" onClick={handleLocalBackup}>
            <DownloadIcon className="backup-btn-icon" />
            <div className="backup-btn-text">
              <span className="backup-btn-title">{t('downloadBackup', lang) || 'Download Backup'}</span>
              <span className="backup-btn-sub">{t('saveToDevice', lang) || 'Save to your device'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

