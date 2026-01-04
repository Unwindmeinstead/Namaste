import { useState } from 'react'
import { CloseIcon, SearchIcon } from './Icons'
import { EntryItem } from './EntryItem'

export function EntriesModal({ isOpen, onClose, entries, settings, onEditEntry, onDeleteEntry }) {
  const [search, setSearch] = useState('')
  
  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    return (
      (e.source || '').toLowerCase().includes(q) ||
      (e.notes || '').toLowerCase().includes(q) ||
      e.amount.toString().includes(q)
    )
  })

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-full">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2>All Entries</h2>
          <div></div>
        </div>

        <div className="search-bar">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="all-entries-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>{entries.length === 0 ? 'No entries yet' : 'No matching entries'}</p>
            </div>
          ) : (
            filtered.map(entry => (
              <EntryItem
                key={entry.id}
                entry={entry}
                settings={settings}
                onEdit={() => onEditEntry(entry)}
                onDelete={() => onDeleteEntry(entry.id)}
              />
            ))
          )}
        </div>

        <div className="entries-count">
          {filtered.length} of {entries.length} entries
        </div>
      </div>
    </div>
  )
}
