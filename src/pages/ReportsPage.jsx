import { useState } from 'react'
import { formatCurrency, groupEntriesByMonth, groupEntriesBySource, getMonthName, getThisYearEntries, formatDate } from '../utils/format'
import { ChartIcon, TrendUpIcon, TrendDownIcon, UserIcon } from '../components/Icons'
import { getTotalMiles } from '../utils/mileage'
import { t } from '../utils/translations'
import { EXPENSE_CATEGORIES, getCategoryById } from '../utils/categories'
import { getCategoryIcon } from '../components/CategoryIcons'
import { haptic } from '../utils/haptic'

// Car icon
const CarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2"/>
    <circle cx="6.5" cy="16.5" r="2.5"/>
    <circle cx="16.5" cy="16.5" r="2.5"/>
  </svg>
)

// Phone icon
const PhoneIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
)

// Location icon
const MapPinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
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

  // Customer tracking - extract unique customers from income entries
  const customerData = incomeEntries.reduce((acc, e) => {
    const name = e.payerName || e.source || 'Unknown'
    if (!acc[name]) {
      acc[name] = {
        name,
        entries: [],
        totalAmount: 0,
        lastDate: e.date,
        addresses: new Set(),
        phones: new Set()
      }
    }
    acc[name].entries.push(e)
    acc[name].totalAmount += e.amount
    if (e.date > acc[name].lastDate) acc[name].lastDate = e.date
    if (e.address) acc[name].addresses.add(e.address)
    // Extract phone from notes or other fields if available
    return acc
  }, {})

  const customers = Object.values(customerData)
    .map(c => ({ ...c, addresses: Array.from(c.addresses) }))
    .sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate))

  const [expandedCustomer, setExpandedCustomer] = useState(null)

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
        <button className={`tab ${view === 'overview' ? 'active' : ''}`} onClick={() => { haptic(); setView('overview') }}>
          {t('overview', lang) || 'Overview'}
        </button>
        <button className={`tab ${view === 'income' ? 'active' : ''}`} onClick={() => { haptic(); setView('income') }}>
          {t('incomeType', lang)}
        </button>
        <button className={`tab ${view === 'expenses' ? 'active' : ''}`} onClick={() => { haptic(); setView('expenses') }}>
          {t('expenseType', lang)}
        </button>
        <button className={`tab ${view === 'customers' ? 'active' : ''}`} onClick={() => { haptic(); setView('customers') }}>
          {t('customers', lang) || 'Customers'}
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

      {/* Customers Tab */}
      {view === 'customers' && (
        <>
          <section className="report-section">
            <div className="customer-header-row">
              <h3 className="report-title">{t('customerDirectory', lang) || 'Customer Directory'}</h3>
              <span className="customer-count">{customers.length} {t('customers', lang) || 'customers'}</span>
            </div>
            
            {customers.length === 0 ? (
              <div className="empty-state small">
                <UserIcon className="empty-icon-svg" />
                <p>{t('noCustomersYet', lang) || 'No customers yet'}</p>
                <p className="empty-hint">{t('addIncomeToSee', lang) || 'Add income entries to see customers here'}</p>
              </div>
            ) : (
              <div className="customer-list">
                {customers.map((customer, i) => {
                  const isExpanded = expandedCustomer === customer.name
                  return (
                    <div key={customer.name} className={`customer-card ${isExpanded ? 'expanded' : ''}`}>
                      <div 
                        className="customer-card-header"
                        onClick={() => { haptic(); setExpandedCustomer(isExpanded ? null : customer.name) }}
                      >
                        <div className="customer-avatar" style={{ background: colors[i % colors.length] }}>
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="customer-info">
                          <span className="customer-name">{customer.name}</span>
                          <span className="customer-meta">
                            {customer.entries.length} {t('services', lang) || 'services'} • {t('last', lang) || 'Last'}: {formatDate(customer.lastDate)}
                          </span>
                        </div>
                        <div className="customer-total">
                          <span className="customer-amount">{formatCurrency(customer.totalAmount, settings.currency)}</span>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="customer-details">
                          {customer.addresses.length > 0 && (
                            <div className="customer-detail-row">
                              <MapPinIcon className="customer-detail-icon" />
                              <span>{customer.addresses.join(', ')}</span>
                            </div>
                          )}
                          
                          <div className="customer-history">
                            <span className="customer-history-title">{t('serviceHistory', lang) || 'Service History'}</span>
                            {customer.entries.slice(0, 5).map(entry => {
                              const cat = getCategoryById(entry.category)
                              return (
                                <div key={entry.id} className="customer-history-item">
                                  <span className="customer-history-date">{formatDate(entry.date)}</span>
                                  <span className="customer-history-service">{cat?.name || entry.category}</span>
                                  <span className="customer-history-amount">{formatCurrency(entry.amount, settings.currency)}</span>
                                </div>
                              )
                            })}
                            {customer.entries.length > 5 && (
                              <div className="customer-history-more">
                                +{customer.entries.length - 5} {t('more', lang) || 'more'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Customer Stats */}
          <section className="report-section">
            <h3 className="report-title">{t('customerStats', lang) || 'Customer Statistics'}</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-item-label">{t('totalCustomers', lang) || 'Total Customers'}</span>
                <span className="summary-item-value">{customers.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('avgPerCustomer', lang) || 'Avg per Customer'}</span>
                <span className="summary-item-value">
                  {formatCurrency(customers.length > 0 ? totalIncome / customers.length : 0, settings.currency)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('repeatCustomers', lang) || 'Repeat Customers'}</span>
                <span className="summary-item-value">{customers.filter(c => c.entries.length > 1).length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">{t('topCustomer', lang) || 'Top Customer'}</span>
                <span className="summary-item-value">{customers[0]?.name?.slice(0, 12) || '-'}</span>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  )
}
