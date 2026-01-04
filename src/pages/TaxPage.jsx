import { useState } from 'react'
import { formatCurrency, calculateQuarterlyTotals, getThisYearEntries, downloadCSV, getCurrentFiscalYear } from '../utils/format'
import { DownloadIcon, CalendarIcon } from '../components/Icons'

export function TaxPage({ entries, settings }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === selectedYear)
  const quarters = calculateQuarterlyTotals(yearEntries)
  const yearTotal = yearEntries.reduce((sum, e) => sum + e.amount, 0)
  
  // Estimated tax (simplified - 25% rate for demo)
  const estimatedTax = yearTotal * 0.25
  const quarterlyTax = estimatedTax / 4

  const years = [...new Set(entries.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a)
  if (!years.includes(selectedYear)) years.unshift(selectedYear)

  const handleExport = () => {
    const filename = `guruji-income-${selectedYear}.csv`
    downloadCSV(yearEntries, filename)
  }

  return (
    <>
      <header className="header">
        <div className="header-left"></div>
        <h1 className="header-title">Tax Center</h1>
        <div className="header-right"></div>
      </header>

      <div className="year-selector">
        <CalendarIcon className="year-icon" />
        <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <section className="tax-summary-card">
        <div className="tax-header">
          <p className="tax-label">Annual Income</p>
          <span className="tax-year">{getCurrentFiscalYear()}</span>
        </div>
        <h2 className="tax-amount">{formatCurrency(yearTotal, settings.currency)}</h2>
        <div className="tax-entries">{yearEntries.length} entries</div>
      </section>

      <section className="report-section">
        <h3 className="report-title">Quarterly Breakdown</h3>
        <div className="quarterly-grid">
          {Object.entries(quarters).map(([quarter, amount]) => (
            <div key={quarter} className="quarter-card">
              <span className="quarter-label">{quarter}</span>
              <span className="quarter-amount">{formatCurrency(amount, settings.currency)}</span>
              <span className="quarter-months">
                {quarter === 'Q1' && 'Jan - Mar'}
                {quarter === 'Q2' && 'Apr - Jun'}
                {quarter === 'Q3' && 'Jul - Sep'}
                {quarter === 'Q4' && 'Oct - Dec'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="report-section">
        <h3 className="report-title">Estimated Tax</h3>
        <div className="tax-estimate-card">
          <div className="tax-row">
            <span>Annual Income</span>
            <span>{formatCurrency(yearTotal, settings.currency)}</span>
          </div>
          <div className="tax-row">
            <span>Est. Tax Rate</span>
            <span>25%</span>
          </div>
          <div className="tax-divider"></div>
          <div className="tax-row highlight">
            <span>Estimated Annual Tax</span>
            <span>{formatCurrency(estimatedTax, settings.currency)}</span>
          </div>
          <div className="tax-row">
            <span>Quarterly Payment</span>
            <span>{formatCurrency(quarterlyTax, settings.currency)}</span>
          </div>
        </div>
        <p className="tax-disclaimer">* This is a simplified estimate. Consult a tax professional for accurate calculations.</p>
      </section>

      <section className="report-section">
        <h3 className="report-title">Export Data</h3>
        <button className="export-btn" onClick={handleExport} disabled={yearEntries.length === 0}>
          <DownloadIcon className="export-icon" />
          <span>Download CSV Report</span>
        </button>
        <p className="export-hint">Export all {selectedYear} income entries for your records or tax filing.</p>
      </section>
    </>
  )
}

