import { useState } from 'react'
import { formatCurrency, groupEntriesByMonth, groupEntriesBySource, getMonthName, getThisYearEntries } from '../utils/format'
import { ChartIcon, TrendUpIcon, TrendDownIcon } from '../components/Icons'
import { getTotalMiles } from '../utils/mileage'
import { t } from '../utils/translations'
import { EXPENSE_CATEGORIES } from '../utils/categories'
import { getCategoryIcon } from '../components/CategoryIcons'

// Car icon
const CarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2"/>
    <circle cx="6.5" cy="16.5" r="2.5"/>
    <circle cx="16.5" cy="16.5" r="2.5"/>
  </svg>
)

export function ReportsPage({ entries, settings }) {
  const [view, setView] = useState('overview')
  const lang = settings.language || 'en'
  
  // Separate income and expenses
  const incomeEntries = entries.filter(e => e.type !== 'expense')
  const expenseEntries = entries.filter(e => e.type === 'expense')
  
  const thisYearEntries = getThisYearEntries(entries)
  const thisYearIncome = thisYearEntries.filter(e => e.type !== 'expense')
  const thisYearExpenses = thisYearEntries.filter(e => e.type === 'expense')
  
  // Totals
  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
  const netIncome = totalIncome - totalExpenses
  const totalMiles = getTotalMiles(entries)
  
  // This year totals
  const thisYearIncomeTotal = thisYearIncome.reduce((sum, e) => sum + e.amount, 0)
  const thisYearExpenseTotal = thisYearExpenses.reduce((sum, e) => sum + e.amount, 0)
  
  // Monthly data
  const monthlyData = groupEntriesByMonth(thisYearEntries)
  const incomeMonthlyData = groupEntriesByMonth(thisYearIncome)
  const expenseMonthlyData = groupEntriesByMonth(thisYearExpenses)
  
  // Create combined monthly chart data
  const allMonths = new Set([...Object.keys(incomeMonthlyData), ...Object.keys(expenseMonthlyData)])
  const monthlyChartData = Array.from(allMonths)
    .sort()
    .map(key => {
      const incomeItems = incomeMonthlyData[key] || []
      const expenseItems = expenseMonthlyData[key] || []
      return {
        month: getMonthName(parseInt(key.split('-')[1]) - 1),
        income: incomeItems.reduce((sum, e) => sum + e.amount, 0),
        expenses: expenseItems.reduce((sum, e) => sum + e.amount, 0),
        net: incomeItems.reduce((sum, e) => sum + e.amount, 0) - expenseItems.reduce((sum, e) => sum + e.amount, 0)
      }
    })

  const maxMonthly = Math.max(...monthlyChartData.map(d => Math.max(d.income, d.expenses)), 1)

  // Source data for income
  const sourceData = groupEntriesBySource(incomeEntries)
  const sourceChartData = Object.entries(sourceData)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6)
  const totalBySource = sourceChartData.reduce((sum, [, data]) => sum + data.total, 0)

  // Expense by category
  const expenseByCategory = expenseEntries.reduce((acc, e) => {
    const cat = e.category || 'other_expense'
    if (!acc[cat]) acc[cat] = { total: 0, count: 0 }
    acc[cat].total += e.amount
    acc[cat].count++
    return acc
  }, {})
  
  const expenseCategoryData = Object.entries(expenseByCategory)
    .sort((a, b) => b[1].total - a[1].total)

  // Payment method breakdown
  const paymentMethodData = entries.reduce((acc, e) => {
    const method = e.paymentMethod || 'cash'
    if (!acc[method]) acc[method] = { income: 0, expense: 0, count: 0 }
    if (e.type === 'expense') {
      acc[method].expense += e.amount
    } else {
      acc[method].income += e.amount
    }
    acc[method].count++
    return acc
  }, {})

  // Average calculations
  const avgIncomePerEntry = incomeEntries.length > 0 ? totalIncome / incomeEntries.length : 0
  const avgExpensePerEntry = expenseEntries.length > 0 ? totalExpenses / expenseEntries.length : 0
  const profitMargin = totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : 0

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#64748b']
  const expenseColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#6366f1']

  const getCatName = (catId) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === catId)
    if (!cat) return catId
    if (lang === 'hi') return cat.nameHi
    if (lang === 'ne') return cat.nameNe
    return cat.name
  }

  return (
    <>
      <header className="header">
        <div className="header-left"></div>
        <h1 className="header-title">{t('reports', lang)}</h1>
        <div className="header-right"></div>
      </header>

      <div className="tab-bar">
        <button className={`tab ${view === 'overview' ? 'active' : ''}`} onClick={() => setView('overview')}>
          {t('overview', lang) || 'Overview'}
        </button>
        <button className={`tab ${view === 'income' ? 'active' : ''}`} onClick={() => setView('income')}>
          {t('incomeType', lang)}
        </button>
        <button className={`tab ${view === 'expenses' ? 'active' : ''}`} onClick={() => setView('expenses')}>
          {t('expenseType', lang)}
        </button>
      </div>

      {/* Overview Tab */}
      {view === 'overview' && (
        <>
          {/* Key Metrics */}
          <section className="report-section">
            <h3 className="report-title">{t('keyMetrics', lang) || 'Key Metrics'}</h3>
            <div className="metrics-grid">
              <div className="metric-card income">
                <TrendUpIcon className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">{t('totalIncome', lang)}</span>
                  <span className="metric-value">{formatCurrency(totalIncome, settings.currency)}</span>
                </div>
              </div>
              <div className="metric-card expense">
                <TrendDownIcon className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">{t('totalExpenses', lang)}</span>
                  <span className="metric-value">-{formatCurrency(totalExpenses, settings.currency)}</span>
                </div>
              </div>
              <div className="metric-card net">
                <ChartIcon className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">{t('netIncome', lang)}</span>
                  <span className={`metric-value ${netIncome < 0 ? 'negative' : ''}`}>
                    {formatCurrency(netIncome, settings.currency)}
                  </span>
                </div>
              </div>
              <div className="metric-card mileage">
                <CarIcon className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">{t('totalMiles', lang) || 'Total Miles'}</span>
                  <span className="metric-value">{totalMiles.toFixed(1)} mi</span>
                </div>
              </div>
            </div>
          </section>

          {/* Monthly Comparison */}
          <section className="report-section">
            <h3 className="report-title">{t('monthlyComparison', lang) || 'Monthly Comparison'}</h3>
            {monthlyChartData.length === 0 ? (
              <div className="empty-state small">
                <ChartIcon className="empty-icon-svg" />
                <p>{t('noData', lang) || 'No data for this year'}</p>
              </div>
            ) : (
              <div className="comparison-chart">
                {monthlyChartData.map((data, i) => (
                  <div key={i} className="comparison-item">
                    <div className="comparison-label">{data.month}</div>
                    <div className="comparison-bars">
                      <div className="comparison-bar income" style={{ width: `${(data.income / maxMonthly) * 100}%` }}>
                        <span>{formatCurrency(data.income, settings.currency)}</span>
                      </div>
                      <div className="comparison-bar expense" style={{ width: `${(data.expenses / maxMonthly) * 100}%` }}>
                        <span>-{formatCurrency(data.expenses, settings.currency)}</span>
                      </div>
                    </div>
                    <div className={`comparison-net ${data.net < 0 ? 'negative' : ''}`}>
                      {data.net >= 0 ? '+' : ''}{formatCurrency(data.net, settings.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Payment Methods */}
          <section className="report-section">
            <h3 className="report-title">{t('paymentMethods', lang) || 'Payment Methods'}</h3>
            <div className="payment-breakdown">
              {Object.entries(paymentMethodData).map(([method, data]) => (
                <div key={method} className="payment-item">
                  <span className="payment-method">{t(method, lang)}</span>
                  <div className="payment-amounts">
                    <span className="payment-income">+{formatCurrency(data.income, settings.currency)}</span>
                    <span className="payment-expense">-{formatCurrency(data.expense, settings.currency)}</span>
                  </div>
                  <span className="payment-count">{data.count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Summary Stats */}
          <section className="report-section">
            <h3 className="report-title">{t('statistics', lang) || 'Statistics'}</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-item-label">{t('profitMargin', lang) || 'Profit Margin'}</span>
                <span className={`summary-item-value ${profitMargin < 0 ? 'negative' : ''}`}>{profitMargin}%</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('avgIncome', lang) || 'Avg Income'}</span>
                <span className="summary-item-value">{formatCurrency(avgIncomePerEntry, settings.currency)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('avgExpense', lang) || 'Avg Expense'}</span>
                <span className="summary-item-value">{formatCurrency(avgExpensePerEntry, settings.currency)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('thisYear', lang)}</span>
                <span className="summary-item-value">{formatCurrency(thisYearIncomeTotal - thisYearExpenseTotal, settings.currency)}</span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Income Tab */}
      {view === 'income' && (
        <>
          <section className="report-section">
            <h3 className="report-title">{t('incomeBySource', lang) || 'Income by Source'}</h3>
            {sourceChartData.length === 0 ? (
              <div className="empty-state small">
                <ChartIcon className="empty-icon-svg" />
                <p>{t('noIncomeYet', lang)}</p>
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
                        <span>{data.count} {t('entries', lang)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="report-section">
            <h3 className="report-title">{t('incomeSummary', lang) || 'Income Summary'}</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-item-label">{t('totalEntries', lang)}</span>
                <span className="summary-item-value">{incomeEntries.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('avgPerEntry', lang) || 'Avg per Entry'}</span>
                <span className="summary-item-value">{formatCurrency(avgIncomePerEntry, settings.currency)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('uniqueSources', lang) || 'Unique Sources'}</span>
                <span className="summary-item-value">{Object.keys(sourceData).length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('thisYear', lang)}</span>
                <span className="summary-item-value">{formatCurrency(thisYearIncomeTotal, settings.currency)}</span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Expenses Tab */}
      {view === 'expenses' && (
        <>
          <section className="report-section">
            <h3 className="report-title">{t('expensesByCategory', lang) || 'Expenses by Category'}</h3>
            {expenseCategoryData.length === 0 ? (
              <div className="empty-state small">
                <ChartIcon className="empty-icon-svg" />
                <p>{t('noExpensesYet', lang) || 'No expenses yet'}</p>
              </div>
            ) : (
              <div className="source-list">
                {expenseCategoryData.map(([catId, data], i) => {
                  const percent = totalExpenses > 0 ? ((data.total / totalExpenses) * 100).toFixed(0) : 0
                  const CatIcon = getCategoryIcon(catId)
                  return (
                    <div key={catId} className="source-item expense-cat">
                      <div className="source-header">
                        <div className="source-icon-wrap" style={{ background: expenseColors[i % expenseColors.length] + '20' }}>
                          <CatIcon className="source-cat-icon" style={{ color: expenseColors[i % expenseColors.length] }} />
                        </div>
                        <span className="source-name">{getCatName(catId)}</span>
                        <span className="source-percent">{percent}%</span>
                      </div>
                      <div className="source-bar-bg">
                        <div 
                          className="source-bar-fill" 
                          style={{ width: `${percent}%`, background: expenseColors[i % expenseColors.length] }}
                        />
                      </div>
                      <div className="source-details">
                        <span className="expense-amount">-{formatCurrency(data.total, settings.currency)}</span>
                        <span>{data.count} {t('entries', lang)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Mileage Section */}
          <section className="report-section">
            <h3 className="report-title">{t('mileageTracking', lang) || 'Mileage Tracking'}</h3>
            <div className="mileage-report-card">
              <div className="mileage-report-main">
                <CarIcon className="mileage-report-icon" />
                <div className="mileage-report-stats">
                  <span className="mileage-report-total">{totalMiles.toFixed(1)} {t('miles', lang) || 'miles'}</span>
                  <span className="mileage-report-label">{t('totalMilesDriven', lang) || 'Total Miles Driven'}</span>
                </div>
              </div>
              <div className="mileage-report-details">
                <div className="mileage-detail">
                  <span className="mileage-detail-label">{t('irsDeduction', lang) || 'IRS Deduction'}</span>
                  <span className="mileage-detail-value">{formatCurrency(totalMiles * 0.67, settings.currency)}</span>
                </div>
                <div className="mileage-detail">
                  <span className="mileage-detail-label">{t('tripsLogged', lang) || 'Trips Logged'}</span>
                  <span className="mileage-detail-value">{entries.filter(e => e.miles).length}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="report-section">
            <h3 className="report-title">{t('expenseSummary', lang) || 'Expense Summary'}</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-item-label">{t('totalEntries', lang)}</span>
                <span className="summary-item-value">{expenseEntries.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('avgPerEntry', lang) || 'Avg per Entry'}</span>
                <span className="summary-item-value">{formatCurrency(avgExpensePerEntry, settings.currency)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('categories', lang) || 'Categories'}</span>
                <span className="summary-item-value">{expenseCategoryData.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('thisYear', lang)}</span>
                <span className="summary-item-value expense-amount">-{formatCurrency(thisYearExpenseTotal, settings.currency)}</span>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  )
}
