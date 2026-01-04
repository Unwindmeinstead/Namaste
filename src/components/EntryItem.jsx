import { formatCurrency, formatDate } from '../utils/format'

export function EntryItem({ entry }) {
  return (
    <div className="entry-item">
      <div className="entry-info">
        <h4>{entry.source || 'Income'}</h4>
        <p>{formatDate(entry.date)}{entry.notes ? ` · ${entry.notes}` : ''}</p>
      </div>
      <div className="entry-amount">+{formatCurrency(entry.amount)}</div>
    </div>
  )
}

