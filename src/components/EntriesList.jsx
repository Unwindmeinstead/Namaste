import { EntryItem } from './EntryItem'

export function EntriesList({ entries, onViewAll }) {
  const recent = entries.slice(0, 10)

  return (
    <section className="entries-section">
      <div className="section-header">
        <h3>Recent</h3>
        <button className="text-btn" onClick={onViewAll}>View All</button>
      </div>
      <div className="entries-list">
        {entries.length === 0 ? (
          <div className="empty-state">
            <p>No income recorded yet</p>
            <p className="empty-hint">Tap + to add your first entry</p>
          </div>
        ) : (
          recent.map(entry => <EntryItem key={entry.id} entry={entry} />)
        )}
      </div>
    </section>
  )
}

