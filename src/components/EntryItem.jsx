import { useState } from 'react'
import { formatCurrency, formatDate } from '../utils/format'
import { getCategoryById } from '../utils/categories'
import { TrashIcon, EditIcon } from './Icons'

export function EntryItem({ entry, settings, onEdit, onDelete, showActions = true }) {
  const [showSwipe, setShowSwipe] = useState(false)
  const category = getCategoryById(entry.category)

  return (
    <div 
      className={`entry-item ${showSwipe ? 'swiped' : ''}`}
      onClick={() => showActions && onEdit?.()}
    >
      <div className="entry-left">
        <div className="entry-emoji">{category.icon}</div>
        <div className="entry-info">
          <h4>{entry.source || 'Income'}</h4>
          <p>{formatDate(entry.date)}{entry.notes ? ` • ${entry.notes}` : ''}</p>
        </div>
      </div>
      <div className="entry-right">
        <div className="entry-amount">+{formatCurrency(entry.amount, settings.currency)}</div>
        {showActions && (
          <div className="entry-actions">
            <button className="entry-action edit" onClick={(e) => { e.stopPropagation(); onEdit?.() }}>
              <EditIcon className="action-icon" />
            </button>
            <button className="entry-action delete" onClick={(e) => { e.stopPropagation(); onDelete?.() }}>
              <TrashIcon className="action-icon" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
