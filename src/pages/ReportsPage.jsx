import { useState } from 'react'
import { formatCurrency, groupEntriesByMonth, groupEntriesBySource, getMonthName, getThisYearEntries } from '../utils/format'
import { ChartIcon } from '../components/Icons'

export function ReportsPage({ entries, settings }) {
  const [view, setView] = useState('monthly')
  const thisYearEntries = getThisYearEntries(entries)
  const monthlyData = groupEntriesByMonth(thisYearEntries)
  const sourceData = groupEntriesBySource(entries)
  
  const monthlyChartData = Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, items]) => ({
      month: getMonthName(parseInt(key.split('-')[1]) - 1),
      total: items.reduce((sum, e) => sum + e.amount, 0),
      count: items.length
    }))

  const maxMonthly = Math.max(...monthlyChartData.map(d => d.total), 1)

  const sourceChartData = Object.entries(sourceData)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6)

  const totalBySource = sourceChartData.reduce((sum, [, data]) => sum + data.total, 0)

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#64748b']

  return (
    <>
      <header className="header">
        <div className="header-left"></div>
        <h1 className="header-title">Reports</h1>
        <div className="header-right"></div>
      </header>

      <div className="tab-bar">
        <button className={`tab ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>
          Monthly
        </button>
        <button className={`tab ${view === 'sources' ? 'active' : ''}`} onClick={() => setView('sources')}>
          Sources
        </button>
      </div>

      {view === 'monthly' && (
        <section className="report-section">
          <h3 className="report-title">Monthly Income</h3>
          {monthlyChartData.length === 0 ? (
            <div className="empty-state small">
              <ChartIcon className="empty-icon-svg" />
              <p>No data for this year</p>
            </div>
          ) : (
            <div className="bar-chart">
              {monthlyChartData.map((data, i) => (
                <div key={i} className="bar-item">
                  <div className="bar-value">{formatCurrency(data.total, settings.currency)}</div>
                  <div className="bar-container">
                    <div 
                      className="bar" 
                      style={{ height: `${(data.total / maxMonthly) * 100}%` }}
                    />
                  </div>
                  <div className="bar-label">{data.month}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {view === 'sources' && (
        <section className="report-section">
          <h3 className="report-title">Income by Source</h3>
          {sourceChartData.length === 0 ? (
            <div className="empty-state small">
              <ChartIcon className="empty-icon-svg" />
              <p>No income sources yet</p>
            </div>
          ) : (
            <div className="source-list">
              {sourceChartData.map(([source, data], i) => {
                const percent = ((data.total / totalBySource) * 100).toFixed(0)
                return (
                  <div key={source} className="source-item">
                    <div className="source-header">
                      <div className="source-color" style={{ background: colors[i] }} />
                      <span className="source-name">{source}</span>
                      <span className="source-percent">{percent}%</span>
                    </div>
                    <div className="source-bar-bg">
                      <div 
                        className="source-bar-fill" 
                        style={{ width: `${percent}%`, background: colors[i] }}
                      />
                    </div>
                    <div className="source-details">
                      <span>{formatCurrency(data.total, settings.currency)}</span>
                      <span>{data.count} entries</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      <section className="report-section">
        <h3 className="report-title">Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-item-label">Total Entries</span>
            <span className="summary-item-value">{entries.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-item-label">Avg per Entry</span>
            <span className="summary-item-value">
              {formatCurrency(entries.length > 0 ? entries.reduce((s, e) => s + e.amount, 0) / entries.length : 0, settings.currency)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-item-label">Unique Sources</span>
            <span className="summary-item-value">{Object.keys(sourceData).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-item-label">This Year</span>
            <span className="summary-item-value">
              {formatCurrency(thisYearEntries.reduce((s, e) => s + e.amount, 0), settings.currency)}
            </span>
          </div>
        </div>
      </section>
    </>
  )
}

