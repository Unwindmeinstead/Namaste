import { ClockIcon, MenuIcon, PlusIcon, TrendUpIcon, TrendDownIcon } from '../components/Icons'
import { formatCurrency, getThisMonthEntries, getLastMonthEntries, getCurrentFiscalYear } from '../utils/format'
import { EntryItem } from '../components/EntryItem'

export function HomePage({ entries, settings, onAddClick, onViewAll, onEditEntry, onDeleteEntry }) {
  const total = entries.reduce((sum, e) => sum + e.amount, 0)
  const thisMonth = getThisMonthEntries(entries)
  const lastMonth = getLastMonthEntries(entries)
  const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0)
  const lastMonthTotal = lastMonth.reduce((sum, e) => sum + e.amount, 0)
  const trend = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(0) : 0
  const recent = entries.slice(0, 5)

  return (
    <>
      <header className="header">
        <div className="header-left">
          <ClockIcon className="logo-icon" />
        </div>
        <h1 className="header-title">Income</h1>
        <div className="header-right">
          <button className="icon-btn" onClick={onViewAll}>
            <MenuIcon className="menu-icon" />
          </button>
        </div>
      </header>

      <section className="summary-card">
        <p className="summary-label">Total Earnings</p>
        <h2 className="summary-amount">{formatCurrency(total, settings.currency)}</h2>
        <p className="summary-period">{getCurrentFiscalYear()}</p>
      </section>

      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-label">This Month</p>
          <p className="stat-value">{formatCurrency(thisMonthTotal, settings.currency)}</p>
          <p className="stat-entries">{thisMonth.length} entries</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Last Month</p>
          <p className="stat-value">{formatCurrency(lastMonthTotal, settings.currency)}</p>
          <div className="stat-trend">
            {trend > 0 ? <TrendUpIcon className="trend-icon up" /> : trend < 0 ? <TrendDownIcon className="trend-icon down" /> : null}
            {trend !== 0 && <span className={trend > 0 ? 'up' : 'down'}>{trend > 0 ? '+' : ''}{trend}%</span>}
          </div>
        </div>
      </div>

      <section className="quick-add">
        <button className="add-btn" onClick={onAddClick}>
          <PlusIcon className="add-icon" />
          <span>Add Income</span>
        </button>
      </section>

      <section className="entries-section">
        <div className="section-header">
          <h3>Recent</h3>
          <button className="text-btn" onClick={onViewAll}>View All ({entries.length})</button>
        </div>
        <div className="entries-list">
          {entries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <p>No income recorded yet</p>
              <p className="empty-hint">Tap + to add your first entry</p>
            </div>
          ) : (
            recent.map(entry => (
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
      </section>
    </>
  )
}

