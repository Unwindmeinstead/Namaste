import { useState } from 'react'
import { formatCurrency, calculateQuarterlyTotals, downloadCSV, getCurrentFiscalYear } from '../utils/format'
import { DownloadIcon, CalendarIcon, EmailIcon, ShareIcon, PrintIcon, FileIcon, ChevronIcon } from '../components/Icons'
import { t } from '../utils/translations'
import { generateTaxReport, downloadTaxReport, emailTaxReport, shareTaxReport, downloadPDF } from '../utils/taxReport'
import { haptic } from '../utils/haptic'
import { 
  calculateCompleteTaxLiability, 
  IRS_MILEAGE_RATE, 
  PA_STATE_TAX_RATE,
  QUARTERLY_DUE_DATES 
} from '../utils/taxCalculations'

// Expandable Section Component
function ExpandableSection({ title, subtitle, badge, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className={`expandable-section ${isOpen ? 'open' : ''}`}>
      <button 
        className="expandable-header" 
        onClick={() => { haptic(); setIsOpen(!isOpen) }}
      >
        <div className="expandable-title-wrap">
          <h4 className="expandable-title">{title}</h4>
          {subtitle && <span className="expandable-subtitle">{subtitle}</span>}
        </div>
        {badge && <span className="expandable-badge">{badge}</span>}
        <ChevronIcon className={`expandable-chevron ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <div className="expandable-content">
          {children}
        </div>
      )}
    </div>
  )
}

export function TaxPage({ entries, settings, profile }) {
  const lang = settings.language || 'en'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [filingStatus, setFilingStatus] = useState('single')
  
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

      {/* Year & Filing Status */}
      <div className="tax-controls">
        <div className="year-selector compact">
          <CalendarIcon className="year-icon" />
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="filing-toggle">
          <button 
            className={`filing-chip ${filingStatus === 'single' ? 'active' : ''}`}
            onClick={() => { haptic(); setFilingStatus('single') }}
          >
            Single
          </button>
          <button 
            className={`filing-chip ${filingStatus === 'married' ? 'active' : ''}`}
            onClick={() => { haptic(); setFilingStatus('married') }}
          >
            Married
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="tax-summary-grid">
        <div className="tax-card income">
          <span className="tax-card-label">Gross Income</span>
          <span className="tax-card-amount">{formatCurrency(yearIncome, settings.currency)}</span>
          <span className="tax-card-count">{incomeEntries.length} entries</span>
        </div>
        <div className="tax-card expense">
          <span className="tax-card-label">Deductions</span>
          <span className="tax-card-amount">{formatCurrency(yearExpenses + taxCalc.mileageDeduction, settings.currency)}</span>
          <span className="tax-card-count">{expenseEntries.length} expenses{totalMiles > 0 ? ` + ${totalMiles.toFixed(0)} mi` : ''}</span>
        </div>
      </div>

      {/* Take Home Hero Card */}
      <div className="take-home-hero">
        <div className="take-home-hero-content">
          <span className="take-home-hero-label">Estimated Take Home</span>
          <span className="take-home-hero-amount">{formatCurrency(taxCalc.estimatedTakeHome, settings.currency)}</span>
          <span className="take-home-hero-sub">
            After {formatCurrency(taxCalc.totalTaxLiability, settings.currency)} in taxes
          </span>
        </div>
        <div className="take-home-hero-rate">
          <span className="rate-value">{(taxCalc.overallEffectiveRate * 100).toFixed(1)}%</span>
          <span className="rate-label">Effective Rate</span>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="tax-sections">
        
        {/* Mileage Deduction */}
        {totalMiles > 0 && (
          <ExpandableSection 
            title="Mileage Deduction" 
            subtitle={`${totalMiles.toFixed(0)} miles logged`}
            badge={formatCurrency(taxCalc.mileageDeduction, settings.currency)}
          >
            <div className="tax-detail-grid">
              <div className="tax-detail-item">
                <span className="tax-detail-label">Total Miles</span>
                <span className="tax-detail-value">{totalMiles.toFixed(1)}</span>
              </div>
              <div className="tax-detail-item">
                <span className="tax-detail-label">IRS Rate (2024)</span>
                <span className="tax-detail-value">${IRS_MILEAGE_RATE}/mile</span>
              </div>
              <div className="tax-detail-item highlight">
                <span className="tax-detail-label">Deduction Amount</span>
                <span className="tax-detail-value success">{formatCurrency(taxCalc.mileageDeduction, settings.currency)}</span>
              </div>
            </div>
          </ExpandableSection>
        )}

        {/* Self-Employment Tax */}
        <ExpandableSection 
          title="Self-Employment Tax" 
          subtitle="Social Security + Medicare"
          badge={formatCurrency(taxCalc.selfEmploymentTax, settings.currency)}
        >
          <div className="tax-detail-grid">
            <div className="tax-detail-item">
              <span className="tax-detail-label">Net SE Income</span>
              <span className="tax-detail-value">{formatCurrency(taxCalc.netSelfEmploymentIncome, settings.currency)}</span>
            </div>
            <div className="tax-detail-item">
              <span className="tax-detail-label">Social Security (12.4%)</span>
              <span className="tax-detail-value">{formatCurrency(taxCalc.socialSecurityTax, settings.currency)}</span>
            </div>
            <div className="tax-detail-item">
              <span className="tax-detail-label">Medicare (2.9%)</span>
              <span className="tax-detail-value">{formatCurrency(taxCalc.medicareTax, settings.currency)}</span>
            </div>
            <div className="tax-detail-item highlight">
              <span className="tax-detail-label">Total SE Tax (15.3%)</span>
              <span className="tax-detail-value warning">{formatCurrency(taxCalc.selfEmploymentTax, settings.currency)}</span>
            </div>
          </div>
          <p className="tax-detail-note">Half of SE tax ({formatCurrency(taxCalc.seTaxDeductible, settings.currency)}) is deductible from your AGI.</p>
        </ExpandableSection>

        {/* Federal Income Tax */}
        <ExpandableSection 
          title="Federal Income Tax" 
          subtitle={`${(taxCalc.federalMarginalRate * 100).toFixed(0)}% marginal bracket`}
          badge={formatCurrency(taxCalc.federalIncomeTax, settings.currency)}
        >
          <div className="tax-detail-grid">
            <div className="tax-detail-item">
              <span className="tax-detail-label">Adjusted Gross Income</span>
              <span className="tax-detail-value">{formatCurrency(taxCalc.adjustedGrossIncome, settings.currency)}</span>
            </div>
            <div className="tax-detail-item">
              <span className="tax-detail-label">Standard Deduction</span>
              <span className="tax-detail-value expense">−{formatCurrency(taxCalc.standardDeduction, settings.currency)}</span>
            </div>
            <div className="tax-detail-item">
              <span className="tax-detail-label">Taxable Income</span>
              <span className="tax-detail-value">{formatCurrency(taxCalc.federalTaxableIncome, settings.currency)}</span>
            </div>
            <div className="tax-detail-item highlight">
              <span className="tax-detail-label">Federal Tax Due</span>
              <span className="tax-detail-value warning">{formatCurrency(taxCalc.federalIncomeTax, settings.currency)}</span>
            </div>
          </div>
          <p className="tax-detail-note">Effective rate: {(taxCalc.federalEffectiveRate * 100).toFixed(1)}% on taxable income.</p>
        </ExpandableSection>

        {/* PA State Tax */}
        <ExpandableSection 
          title="Pennsylvania State Tax" 
          subtitle={`Flat ${(PA_STATE_TAX_RATE * 100).toFixed(2)}% rate`}
          badge={formatCurrency(taxCalc.paStateTax, settings.currency)}
        >
          <div className="tax-detail-grid">
            <div className="tax-detail-item">
              <span className="tax-detail-label">PA Taxable Income</span>
              <span className="tax-detail-value">{formatCurrency(taxCalc.paTaxableIncome, settings.currency)}</span>
            </div>
            <div className="tax-detail-item">
              <span className="tax-detail-label">PA Tax Rate</span>
              <span className="tax-detail-value">{(PA_STATE_TAX_RATE * 100).toFixed(2)}%</span>
            </div>
            <div className="tax-detail-item highlight">
              <span className="tax-detail-label">PA State Tax Due</span>
              <span className="tax-detail-value warning">{formatCurrency(taxCalc.paStateTax, settings.currency)}</span>
            </div>
          </div>
          <p className="tax-detail-note">Pennsylvania has a flat income tax rate with no standard deduction.</p>
        </ExpandableSection>

        {/* Quarterly Payments */}
        <ExpandableSection 
          title="Quarterly Payments" 
          subtitle="Estimated payment schedule"
          badge={`${formatCurrency(taxCalc.quarterlyTotal, settings.currency)}/qtr`}
        >
          <div className="quarterly-schedule">
            {Object.entries(QUARTERLY_DUE_DATES).map(([q, info]) => (
              <div key={q} className="quarterly-item">
                <div className="quarterly-item-header">
                  <span className="quarterly-item-q">{q}</span>
                  <span className="quarterly-item-period">{info.period}</span>
                </div>
                <div className="quarterly-item-due">Due: {info.due}</div>
                <div className="quarterly-item-amounts">
                  <span>Federal: {formatCurrency(taxCalc.quarterlyFederal, settings.currency)}</span>
                  <span>PA: {formatCurrency(taxCalc.quarterlyPA, settings.currency)}</span>
                </div>
                <div className="quarterly-item-total">
                  {formatCurrency(taxCalc.quarterlyTotal, settings.currency)}
                </div>
              </div>
            ))}
          </div>
        </ExpandableSection>

        {/* Income Breakdown */}
        <ExpandableSection 
          title="Quarterly Breakdown" 
          subtitle="Income vs expenses by quarter"
        >
          <div className="quarter-breakdown-grid">
            {Object.entries(quarters).map(([quarter, data]) => (
              <div key={quarter} className="quarter-breakdown-item">
                <span className="qb-quarter">{quarter}</span>
                <div className="qb-data">
                  <span className="qb-income">+{formatCurrency(data.income, settings.currency)}</span>
                  <span className="qb-expense">−{formatCurrency(data.expense, settings.currency)}</span>
                  <span className="qb-net">{formatCurrency(data.income - data.expense, settings.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </ExpandableSection>

      </div>

      {/* Total Tax Summary */}
      <div className="tax-total-card">
        <div className="tax-total-row">
          <span>Self-Employment Tax</span>
          <span>{formatCurrency(taxCalc.selfEmploymentTax, settings.currency)}</span>
        </div>
        <div className="tax-total-row">
          <span>Federal Income Tax</span>
          <span>{formatCurrency(taxCalc.federalIncomeTax, settings.currency)}</span>
        </div>
        <div className="tax-total-row">
          <span>PA State Tax</span>
          <span>{formatCurrency(taxCalc.paStateTax, settings.currency)}</span>
        </div>
        <div className="tax-total-divider"></div>
        <div className="tax-total-row total">
          <span>Total Tax Liability</span>
          <span>{formatCurrency(taxCalc.totalTaxLiability, settings.currency)}</span>
        </div>
      </div>

      <p className="tax-disclaimer">
        Estimates based on 2024 PA & Federal rates for self-employed individuals. Consult a tax professional for accurate advice.
      </p>

      {/* Export Section */}
      <section className="report-section">
        <h3 className="report-title">{t('generateReport', lang)}</h3>
        
        <div className="report-actions">
          <button className="report-action-btn primary" onClick={handleDownloadPDF} disabled={yearEntries.length === 0}>
            <PrintIcon className="report-action-icon" />
            <div className="report-action-text">
              <span className="report-action-title">Download PDF</span>
              <span className="report-action-desc">Printable tax report</span>
            </div>
          </button>

          <button className="report-action-btn" onClick={handlePreview} disabled={yearEntries.length === 0}>
            <FileIcon className="report-action-icon" />
            <div className="report-action-text">
              <span className="report-action-title">Preview Report</span>
              <span className="report-action-desc">View detailed report</span>
            </div>
          </button>

          <button className="report-action-btn" onClick={handleEmailReport} disabled={yearEntries.length === 0}>
            <EmailIcon className="report-action-icon" />
            <div className="report-action-text">
              <span className="report-action-title">Email Report</span>
              <span className="report-action-desc">Send via email</span>
            </div>
          </button>

          <button className="report-action-btn" onClick={handleShareReport} disabled={yearEntries.length === 0}>
            <ShareIcon className="report-action-icon" />
            <div className="report-action-text">
              <span className="report-action-title">Share</span>
              <span className="report-action-desc">Share report file</span>
            </div>
          </button>
        </div>

        <div className="csv-export-row">
          <button className="export-btn secondary" onClick={handleExportCSV} disabled={yearEntries.length === 0}>
            <DownloadIcon className="export-icon" />
            <span>Download CSV</span>
          </button>
        </div>
      </section>
    </>
  )
}
