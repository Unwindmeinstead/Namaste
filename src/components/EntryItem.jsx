import { formatCurrency, formatDate } from '../utils/format'
import { getCategoryById } from '../utils/categories'
import { TrashIcon, EditIcon } from './Icons'

export function EntryItem({ entry, settings, onEdit, onDelete, showActions = true }) {
  const category = getCategoryById(entry.category)
  const isExpense = entry.type === 'expense'
  const lang = settings.language || 'en'

  return (
    <div 
      className={`entry-item ${isExpense ? 'expense' : ''}`}
      onClick={() => showActions && onEdit?.()}
    >
      <div className="entry-left">
        <div className="entry-emoji">{category.icon}</div>
        <div className="entry-info">
          <h4>{entry.source || (lang === 'hi' ? category.nameHi : category.name)}</h4>
          <p>{formatDate(entry.date)}{entry.notes ? ` • ${entry.notes}` : ''}</p>
        </div>
      </div>
      <div className="entry-right">
        <div className={`entry-amount ${isExpense ? 'expense' : ''}`}>
          {isExpense ? '-' : '+'}{formatCurrency(entry.amount, settings.currency)}
        </div>
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
