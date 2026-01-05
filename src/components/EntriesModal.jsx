import { useState } from 'react'
import { CloseIcon, SearchIcon } from './Icons'
import { EntryItem } from './EntryItem'
import { t } from '../utils/translations'

export function EntriesModal({ isOpen, onClose, entries, settings, onEditEntry, onDeleteEntry, getLinkedExpenses }) {
  const [search, setSearch] = useState('')
  const lang = settings.language || 'en'
  
  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    return (
      (e.source || '').toLowerCase().includes(q) ||
      (e.notes || '').toLowerCase().includes(q) ||
      e.amount.toString().includes(q)
    )
  })
  
  // Separate income and standalone expenses
  const incomeEntries = filtered.filter(e => e.type !== 'expense')
  const standaloneExpenses = filtered.filter(e => e.type === 'expense' && !e.relatedTo)

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-full">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2>{t('allEntries', lang)}</h2>
          <div></div>
        </div>

        <div className="search-bar">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder={t('searchEntries', lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="all-entries-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>{entries.length === 0 ? t('noEntriesYet', lang) : t('noMatchingEntries', lang)}</p>
            </div>
          ) : (
            <>
              {/* Income entries with their linked expenses */}
              {incomeEntries.map(entry => (
                <EntryItem
                  key={entry.id}
                  entry={entry}
                  settings={settings}
                  onEdit={() => onEditEntry(entry)}
                  onDelete={() => onDeleteEntry(entry.id)}
                  linkedExpenses={getLinkedExpenses ? getLinkedExpenses(entry.id) : []}
                  onEditExpense={onEditEntry}
                  onDeleteExpense={onDeleteEntry}
                />
              ))}
              
              {/* Standalone expenses (not linked to any job) */}
              {standaloneExpenses.map(entry => (
                <EntryItem
                  key={entry.id}
                  entry={entry}
                  settings={settings}
                  onEdit={() => onEditEntry(entry)}
                  onDelete={() => onDeleteEntry(entry.id)}
                />
              ))}
            </>
          )}
        </div>

        <div className="entries-count">
          {filtered.length} {t('of', lang)} {entries.length} {t('entries', lang)}
        </div>
      </div>
    </div>
  )
}
