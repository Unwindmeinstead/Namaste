import { EntryItem } from './EntryItem'

export function EntriesModal({ isOpen, onClose, entries }) {
  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-full">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <h2>All Entries</h2>
          <div></div>
        </div>
        <div className="all-entries-list">
          {entries.length === 0 ? (
            <div className="empty-state">
              <p>No income recorded yet</p>
              <p className="empty-hint">Tap + to add your first entry</p>
            </div>
          ) : (
            entries.map(entry => <EntryItem key={entry.id} entry={entry} />)
          )}
        </div>
      </div>
    </div>
  )
}

