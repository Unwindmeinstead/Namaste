import { useState } from 'react'
import { formatCurrency, calculateQuarterlyTotals, downloadCSV, getCurrentFiscalYear } from '../utils/format'
import { DownloadIcon, CalendarIcon, EmailIcon, ShareIcon, PrintIcon, FileIcon, ChevronIcon } from '../components/Icons'
import { t } from '../utils/translations'
import { generateTaxReport, downloadTaxReport, emailTaxReport, shareTaxReport, downloadPDF } from '../utils/taxReport'
import { 
  calculateCompleteTaxLiability, 
  IRS_MILEAGE_RATE, 
  PA_STATE_TAX_RATE,
  QUARTERLY_DUE_DATES 
} from '../utils/taxCalculations'

export function TaxPage({ entries, settings, profile }) {
  const lang = settings.language || 'en'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showPreview, setShowPreview] = useState(false)
  const [filingStatus, setFilingStatus] = useState('single')
  const [showTaxDetails, setShowTaxDetails] = useState(false)
  
  const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === selectedYear)
  const incomeEntries = yearEntries.filter(e => e.type !== 'expense')
  const expenseEntries = yearEntries.filter(e => e.type === 'expense')
  
  const yearIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
  const yearExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
  const totalMiles = yearEntries.filter(e => e.miles).reduce((sum, e) => sum + (e.miles || 0), 0)
  
  // Complete PA + Federal tax calculation
  const taxCalc = calculateCompleteTaxLiability({
    grossIncome: yearIncome,
    totalExpenses: yearExpenses,
    totalMiles,
    filingStatus
  })
  
  const quarters = { Q1: { income: 0, expense: 0 }, Q2: { income: 0, expense: 0 }, Q3: { income: 0, expense: 0 }, Q4: { income: 0, expense: 0 } }
  yearEntries.forEach(e => {
    const month = new Date(e.date).getMonth()
    const q = month < 3 ? 'Q1' : month < 6 ? 'Q2' : month < 9 ? 'Q3' : 'Q4'
    if (e.type === 'expense') quarters[q].expense += e.amount
    else quarters[q].income += e.amount
  })

  const years = [...new Set(entries.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a)
  if (!years.includes(selectedYear)) years.unshift(selectedYear)

  const handleExportCSV = () => {
    downloadCSV(yearEntries, `yagya-income-${selectedYear}.csv`)
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

      {/* Filing Status Selector */}
      <div className="filing-status-selector">
        <label className="filing-label">{t('filingStatus', lang) || 'Filing Status'}</label>
        <div className="filing-options">
          <button 
            className={`filing-btn ${filingStatus === 'single' ? 'active' : ''}`}
            onClick={() => setFilingStatus('single')}
          >
            Single
          </button>
          <button 
            className={`filing-btn ${filingStatus === 'married' ? 'active' : ''}`}
            onClick={() => setFilingStatus('married')}
          >
            Married
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="tax-summary-grid">
        <div className="tax-card income">
          <span className="tax-card-label">{t('grossIncome', lang) || 'Gross Income'}</span>
          <span className="tax-card-amount">{formatCurrency(yearIncome, settings.currency)}</span>
          <span className="tax-card-count">{incomeEntries.length} {t('entries', lang)}</span>
        </div>
        <div className="tax-card expense">
          <span className="tax-card-label">{t('deductions', lang) || 'Deductions'}</span>
          <span className="tax-card-amount">{formatCurrency(yearExpenses + taxCalc.mileageDeduction, settings.currency)}</span>
          <span className="tax-card-count">{totalMiles > 0 ? `+ ${totalMiles.toFixed(0)} mi` : ''}</span>
        </div>
        <div className="tax-card net">
          <span className="tax-card-label">{t('netIncome', lang)}</span>
          <span className="tax-card-amount">{formatCurrency(taxCalc.netSelfEmploymentIncome, settings.currency)}</span>
          <span className="tax-card-count">{t('taxable', lang) || 'Self-employment income'}</span>
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

      {/* Mileage Deduction Card */}
      {totalMiles > 0 && (
        <section className="report-section">
          <h3 className="report-title">{t('mileageDeduction', lang) || 'Mileage Deduction'}</h3>
          <div className="mileage-card">
            <div className="mileage-stat">
              <span className="mileage-value">{totalMiles.toFixed(1)}</span>
              <span className="mileage-label">{t('totalMiles', lang) || 'Total Miles'}</span>
            </div>
            <div className="mileage-calc">
              <span className="mileage-rate">${IRS_MILEAGE_RATE}/mi</span>
              <span className="mileage-operator">×</span>
            </div>
            <div className="mileage-result">
              <span className="mileage-deduction">{formatCurrency(taxCalc.mileageDeduction, settings.currency)}</span>
              <span className="mileage-label">{t('irsDeduction', lang) || 'IRS Deduction'}</span>
            </div>
          </div>
        </section>
      )}

      <section className="report-section">
        <h3 className="report-title">{t('estimatedTax', lang) || 'Estimated Tax Liability'}</h3>
        <p className="section-subtitle">Pennsylvania + Federal (Self-Employed)</p>
        
        <div className="tax-estimate-card enhanced">
          {/* Income Calculation */}
          <div className="tax-section-header">Income Calculation</div>
          <div className="tax-row">
            <span>{t('grossIncome', lang) || 'Gross Income'}</span>
            <span className="income-text">+{formatCurrency(yearIncome, settings.currency)}</span>
          </div>
          <div className="tax-row">
            <span>{t('businessExpenses', lang) || 'Business Expenses'}</span>
            <span className="expense-text">−{formatCurrency(yearExpenses, settings.currency)}</span>
          </div>
          {totalMiles > 0 && (
            <div className="tax-row">
              <span>{t('mileageDeduction', lang) || 'Mileage Deduction'} ({totalMiles.toFixed(0)} mi)</span>
              <span className="expense-text">−{formatCurrency(taxCalc.mileageDeduction, settings.currency)}</span>
            </div>
          )}
          <div className="tax-divider"></div>
          <div className="tax-row bold">
            <span>{t('netSelfEmployment', lang) || 'Net Self-Employment Income'}</span>
            <span>{formatCurrency(taxCalc.netSelfEmploymentIncome, settings.currency)}</span>
          </div>

          {/* Self-Employment Tax */}
          <div className="tax-section-header">Self-Employment Tax (15.3%)</div>
          <div className="tax-row sub">
            <span>Social Security (12.4%)</span>
            <span>{formatCurrency(taxCalc.socialSecurityTax, settings.currency)}</span>
          </div>
          <div className="tax-row sub">
            <span>Medicare (2.9%)</span>
            <span>{formatCurrency(taxCalc.medicareTax, settings.currency)}</span>
          </div>
          <div className="tax-row bold">
            <span>{t('selfEmploymentTax', lang) || 'Self-Employment Tax'}</span>
            <span className="tax-amount">{formatCurrency(taxCalc.selfEmploymentTax, settings.currency)}</span>
          </div>

          {/* Federal Income Tax */}
          <div className="tax-section-header">Federal Income Tax</div>
          <div className="tax-row sub">
            <span>AGI after SE Deduction</span>
            <span>{formatCurrency(taxCalc.adjustedGrossIncome, settings.currency)}</span>
          </div>
          <div className="tax-row sub">
            <span>Standard Deduction ({filingStatus})</span>
            <span className="expense-text">−{formatCurrency(taxCalc.standardDeduction, settings.currency)}</span>
          </div>
          <div className="tax-row sub">
            <span>Federal Taxable Income</span>
            <span>{formatCurrency(taxCalc.federalTaxableIncome, settings.currency)}</span>
          </div>
          <div className="tax-row bold">
            <span>{t('federalIncomeTax', lang) || 'Federal Income Tax'}</span>
            <span className="tax-amount">{formatCurrency(taxCalc.federalIncomeTax, settings.currency)}</span>
          </div>
          <div className="tax-row sub muted">
            <span>Marginal Rate: {(taxCalc.federalMarginalRate * 100).toFixed(0)}% | Effective: {(taxCalc.federalEffectiveRate * 100).toFixed(1)}%</span>
          </div>

          {/* PA State Tax */}
          <div className="tax-section-header">Pennsylvania State Tax</div>
          <div className="tax-row sub">
            <span>PA Taxable Income</span>
            <span>{formatCurrency(taxCalc.paTaxableIncome, settings.currency)}</span>
          </div>
          <div className="tax-row bold">
            <span>PA State Tax ({(PA_STATE_TAX_RATE * 100).toFixed(2)}%)</span>
            <span className="tax-amount">{formatCurrency(taxCalc.paStateTax, settings.currency)}</span>
          </div>

          {/* Total Tax */}
          <div className="tax-divider thick"></div>
          <div className="tax-row highlight total">
            <span>{t('totalTaxLiability', lang) || 'Total Tax Liability'}</span>
            <span>{formatCurrency(taxCalc.totalTaxLiability, settings.currency)}</span>
          </div>
          <div className="tax-row sub muted">
            <span>Effective Rate: {(taxCalc.overallEffectiveRate * 100).toFixed(1)}% of gross income</span>
          </div>
        </div>

        {/* Quarterly Payments */}
        <div className="quarterly-payments-card">
          <h4 className="quarterly-title">{t('quarterlyPayments', lang) || 'Estimated Quarterly Payments'}</h4>
          <div className="quarterly-payment-grid">
            {Object.entries(QUARTERLY_DUE_DATES).map(([q, info]) => (
              <div key={q} className="quarterly-payment-item">
                <div className="qp-header">
                  <span className="qp-quarter">{q}</span>
                  <span className="qp-due">Due: {info.due}</span>
                </div>
                <div className="qp-amounts">
                  <div className="qp-row">
                    <span>Federal</span>
                    <span>{formatCurrency(taxCalc.quarterlyFederal, settings.currency)}</span>
                  </div>
                  <div className="qp-row">
                    <span>PA State</span>
                    <span>{formatCurrency(taxCalc.quarterlyPA, settings.currency)}</span>
                  </div>
                  <div className="qp-row total">
                    <span>Total</span>
                    <span>{formatCurrency(taxCalc.quarterlyTotal, settings.currency)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Take Home Estimate */}
        <div className="take-home-card">
          <div className="take-home-label">{t('estimatedTakeHome', lang) || 'Estimated Take Home'}</div>
          <div className="take-home-amount">{formatCurrency(taxCalc.estimatedTakeHome, settings.currency)}</div>
          <div className="take-home-breakdown">
            <span>Gross: {formatCurrency(yearIncome, settings.currency)}</span>
            <span>−</span>
            <span>Expenses: {formatCurrency(yearExpenses + taxCalc.mileageDeduction, settings.currency)}</span>
            <span>−</span>
            <span>Taxes: {formatCurrency(taxCalc.totalTaxLiability, settings.currency)}</span>
          </div>
        </div>

        <p className="tax-disclaimer">{t('taxDisclaimer', lang) || 'This is an estimate for informational purposes only. Consult a tax professional for accurate tax advice. Rates are based on 2024 PA and Federal tax laws.'}</p>
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
