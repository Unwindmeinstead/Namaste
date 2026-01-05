import { useState } from 'react'
import { formatCurrency, calculateQuarterlyTotals, downloadCSV, getCurrentFiscalYear } from '../utils/format'
import { DownloadIcon, CalendarIcon, EmailIcon, ShareIcon, PrintIcon, FileIcon } from '../components/Icons'
import { t } from '../utils/translations'
import { generateTaxReport, downloadTaxReport, emailTaxReport, shareTaxReport, downloadPDF } from '../utils/taxReport'

export function TaxPage({ entries, settings, profile }) {
  const lang = settings.language || 'en'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showPreview, setShowPreview] = useState(false)
  
  const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === selectedYear)
  const incomeEntries = yearEntries.filter(e => e.type !== 'expense')
  const expenseEntries = yearEntries.filter(e => e.type === 'expense')
  
  const yearIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
  const yearExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
  const netIncome = yearIncome - yearExpenses
  
  const quarters = { Q1: { income: 0, expense: 0 }, Q2: { income: 0, expense: 0 }, Q3: { income: 0, expense: 0 }, Q4: { income: 0, expense: 0 } }
  yearEntries.forEach(e => {
    const month = new Date(e.date).getMonth()
    const q = month < 3 ? 'Q1' : month < 6 ? 'Q2' : month < 9 ? 'Q3' : 'Q4'
    if (e.type === 'expense') quarters[q].expense += e.amount
    else quarters[q].income += e.amount
  })
  
  // Estimated tax (simplified - 25% rate for demo)
  const estimatedTax = netIncome > 0 ? netIncome * 0.25 : 0
  const quarterlyTax = estimatedTax / 4

  const years = [...new Set(entries.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a)
  if (!years.includes(selectedYear)) years.unshift(selectedYear)

  const handleExportCSV = () => {
    downloadCSV(yearEntries, `dakshina-income-${selectedYear}.csv`)
  }

  const handleDownloadReport = () => {
    downloadTaxReport(entries, profile, settings, selectedYear)
  }

  const handleEmailReport = () => {
    emailTaxReport(entries, profile, settings, selectedYear)
  }

  const handleShareReport = () => {
    shareTaxReport(entries, profile, settings, selectedYear)
  }

  const handlePreview = () => {
    const html = generateTaxReport(entries, profile, settings, selectedYear)
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
  }

  const handleDownloadPDF = () => {
    downloadPDF(entries, profile, settings, selectedYear)
  }

  return (
    <>
      <header className="header">
        <div className="header-left"></div>
        <h1 className="header-title">{t('taxCenter', lang)}</h1>
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

      {/* Summary Cards */}
      <div className="tax-summary-grid">
        <div className="tax-card income">
          <span className="tax-card-label">{t('totalIncome', lang)}</span>
          <span className="tax-card-amount">{formatCurrency(yearIncome, settings.currency)}</span>
          <span className="tax-card-count">{incomeEntries.length} {t('entries', lang)}</span>
        </div>
        <div className="tax-card expense">
          <span className="tax-card-label">{t('totalExpenses', lang)}</span>
          <span className="tax-card-amount">{formatCurrency(yearExpenses, settings.currency)}</span>
          <span className="tax-card-count">{expenseEntries.length} {t('entries', lang)}</span>
        </div>
        <div className="tax-card net">
          <span className="tax-card-label">{t('netIncome', lang)}</span>
          <span className="tax-card-amount">{formatCurrency(netIncome, settings.currency)}</span>
          <span className="tax-card-count">{t('taxable', lang) || 'Taxable amount'}</span>
        </div>
      </div>

      <section className="report-section">
        <h3 className="report-title">{t('quarterlyBreakdown', lang)}</h3>
        <div className="quarterly-grid enhanced">
          {Object.entries(quarters).map(([quarter, data]) => (
            <div key={quarter} className="quarter-card enhanced">
              <span className="quarter-label">{quarter}</span>
              <div className="quarter-data">
                <div className="quarter-row income">
                  <span>+</span>
                  <span>{formatCurrency(data.income, settings.currency)}</span>
                </div>
                <div className="quarter-row expense">
                  <span>−</span>
                  <span>{formatCurrency(data.expense, settings.currency)}</span>
                </div>
                <div className="quarter-row net">
                  <span>=</span>
                  <span>{formatCurrency(data.income - data.expense, settings.currency)}</span>
                </div>
              </div>
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
        <h3 className="report-title">{t('estimatedTax', lang)}</h3>
        <div className="tax-estimate-card enhanced">
          <div className="tax-row">
            <span>{t('totalIncome', lang)}</span>
            <span className="income-text">+{formatCurrency(yearIncome, settings.currency)}</span>
          </div>
          <div className="tax-row">
            <span>{t('totalExpenses', lang)}</span>
            <span className="expense-text">−{formatCurrency(yearExpenses, settings.currency)}</span>
          </div>
          <div className="tax-divider"></div>
          <div className="tax-row">
            <span>{t('netIncome', lang)}</span>
            <span>{formatCurrency(netIncome, settings.currency)}</span>
          </div>
          <div className="tax-row">
            <span>{t('estTaxRate', lang)}</span>
            <span>25%</span>
          </div>
          <div className="tax-divider"></div>
          <div className="tax-row highlight">
            <span>{t('estimatedAnnualTax', lang)}</span>
            <span>{formatCurrency(estimatedTax, settings.currency)}</span>
          </div>
          <div className="tax-row">
            <span>{t('quarterlyPayment', lang)}</span>
            <span>{formatCurrency(quarterlyTax, settings.currency)}</span>
          </div>
        </div>
        <p className="tax-disclaimer">{t('taxDisclaimer', lang)}</p>
      </section>

      <section className="report-section">
        <h3 className="report-title">{t('generateReport', lang)}</h3>
        
        <div className="report-actions">
          <button className="report-action-btn primary" onClick={handleDownloadPDF} disabled={yearEntries.length === 0}>
            <PrintIcon className="report-action-icon" />
            <div className="report-action-text">
              <span className="report-action-title">{t('downloadPDF', lang) || 'Download PDF'}</span>
              <span className="report-action-desc">{t('printableTaxReport', lang) || 'Printable tax report'}</span>
            </div>
          </button>

          <button className="report-action-btn" onClick={handlePreview} disabled={yearEntries.length === 0}>
            <FileIcon className="report-action-icon" />
            <div className="report-action-text">
              <span className="report-action-title">{t('previewReport', lang)}</span>
              <span className="report-action-desc">{t('viewDetailedReport', lang) || 'View detailed report'}</span>
            </div>
          </button>

          <button className="report-action-btn" onClick={handleDownloadReport} disabled={yearEntries.length === 0}>
            <DownloadIcon className="report-action-icon" />
            <div className="report-action-text">
              <span className="report-action-title">{t('downloadReport', lang)}</span>
              <span className="report-action-desc">{t('saveAsHTML', lang) || 'Save as HTML file'}</span>
            </div>
          </button>

          <button className="report-action-btn" onClick={handleEmailReport} disabled={yearEntries.length === 0}>
            <EmailIcon className="report-action-icon" />
            <div className="report-action-text">
              <span className="report-action-title">{t('emailReport', lang)}</span>
              <span className="report-action-desc">Send via email</span>
            </div>
          </button>

          <button className="report-action-btn" onClick={handleShareReport} disabled={yearEntries.length === 0}>
            <ShareIcon className="report-action-icon" />
            <div className="report-action-text">
              <span className="report-action-title">{t('shareReport', lang)}</span>
              <span className="report-action-desc">Share report file</span>
            </div>
          </button>
        </div>

        <div className="csv-export-row">
          <button className="export-btn secondary" onClick={handleExportCSV} disabled={yearEntries.length === 0}>
            <DownloadIcon className="export-icon" />
            <span>{t('downloadCSV', lang)}</span>
          </button>
        </div>
        
        <p className="export-hint">{t('exportHint', lang)}</p>
      </section>
    </>
  )
}
