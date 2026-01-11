import { ClockIcon, UserIcon, PlusIcon, TrendUpIcon, TrendDownIcon } from '../components/Icons'

// Yagya Logo - Sacred Fire (Havan Kund)
const YagyaLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 80 100" fill="currentColor">
    {/* Main flame */}
    <path d="M40 0 C50 15, 55 30, 40 50 C25 30, 30 15, 40 0Z"/>
    {/* Inner flame */}
    <path d="M40 10 C46 20, 48 32, 40 45 C32 32, 34 20, 40 10Z" fill="var(--bg-primary, #0a0a0a)"/>
    {/* Left flame */}
    <path d="M25 25 C30 35, 32 45, 25 55 C18 45, 20 35, 25 25Z"/>
    {/* Right flame */}
    <path d="M55 25 C60 35, 62 45, 55 55 C48 45, 50 35, 55 25Z"/>
    {/* Havan kund base */}
    <path d="M10 65 L20 55 L60 55 L70 65 Z"/>
    <rect x="8" y="65" width="64" height="8" rx="2"/>
    {/* Base platform */}
    <path d="M5 73 L15 85 L65 85 L75 73 Z"/>
    <rect x="12" y="85" width="56" height="6" rx="1"/>
    {/* Bottom */}
    <rect x="20" y="91" width="40" height="4" rx="1"/>
  </svg>
)
import { formatCurrency, getThisMonthEntries, getLastMonthEntries, getCurrentFiscalYear, toLocalDateString } from '../utils/format'
import { EntryItem } from '../components/EntryItem'
import { Calendar } from '../components/Calendar'
import { t } from '../utils/translations'

export function HomePage({ entries, scheduledServices, settings, onAddClick, onViewAll, onActivityClick, onEditEntry, onDeleteEntry, getLinkedExpenses, onProfileClick, onDayClick, onAddService }) {
  const lang = settings.language || 'en'
  
  // Calculate income and expenses
  const incomeEntries = entries.filter(e => e.type !== 'expense')
  const expenseEntries = entries.filter(e => e.type === 'expense')
  
  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
  const netIncome = totalIncome - totalExpenses
  
  const thisMonth = getThisMonthEntries(entries)
  const lastMonth = getLastMonthEntries(entries)
  
  const thisMonthIncome = thisMonth.filter(e => e.type !== 'expense').reduce((sum, e) => sum + e.amount, 0)
  const thisMonthExpenses = thisMonth.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
  const thisMonthNet = thisMonthIncome - thisMonthExpenses
  
  const lastMonthIncome = lastMonth.filter(e => e.type !== 'expense').reduce((sum, e) => sum + e.amount, 0)
  const lastMonthExpenses = lastMonth.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
  const lastMonthNet = lastMonthIncome - lastMonthExpenses
  
  const trend = lastMonthNet !== 0 ? ((thisMonthNet - lastMonthNet) / Math.abs(lastMonthNet) * 100).toFixed(0) : 0
  
  // Get recent income entries (not expenses that are linked)
  const recentIncomeEntries = incomeEntries.slice(0, 3)

  // Get upcoming scheduled services
  const today = toLocalDateString(new Date())
  const upcomingServices = (scheduledServices || [])
    .filter(s => s.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3)

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button className="icon-btn" onClick={onActivityClick} title={t('recentActivity', lang)}>
            <ClockIcon className="logo-icon" />
          </button>
        </div>
        <div className="header-brand">
          <YagyaLogo className="header-logo" />
          <span className="header-brand-name">
            <span className="brand-d">य</span>agya
          </span>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={onProfileClick} title={t('profile', lang)}>
            <UserIcon className="menu-icon" />
          </button>
        </div>
      </header>

      <section className="summary-card">
        <p className="summary-label">{t('netIncome', lang)}</p>
        <h2 className={`summary-amount ${netIncome < 0 ? 'negative' : ''}`}>
          {netIncome < 0 ? '-' : ''}{formatCurrency(Math.abs(netIncome), settings.currency)}
        </h2>
        <p className="summary-period">{getCurrentFiscalYear()}</p>
        <div className="summary-breakdown">
          <span className="income-total">+{formatCurrency(totalIncome, settings.currency)}</span>
          <span className="expense-total">-{formatCurrency(totalExpenses, settings.currency)}</span>
        </div>
      </section>

      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-label">{t('thisMonth', lang)}</p>
          <p className={`stat-value ${thisMonthNet < 0 ? 'negative' : ''}`}>
            {thisMonthNet < 0 ? '-' : ''}{formatCurrency(Math.abs(thisMonthNet), settings.currency)}
          </p>
          <p className="stat-entries">{thisMonth.length} {t('entries', lang)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">{t('lastMonth', lang)}</p>
          <p className={`stat-value ${lastMonthNet < 0 ? 'negative' : ''}`}>
            {lastMonthNet < 0 ? '-' : ''}{formatCurrency(Math.abs(lastMonthNet), settings.currency)}
          </p>
          <div className="stat-trend">
            {trend > 0 ? <TrendUpIcon className="trend-icon up" /> : trend < 0 ? <TrendDownIcon className="trend-icon down" /> : null}
            {trend !== 0 && <span className={trend > 0 ? 'up' : 'down'}>{trend > 0 ? '+' : ''}{trend}%</span>}
          </div>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="expense-card">
        <div className="expense-card-content">
          <div className="expense-card-icon">
            <TrendDownIcon className="expense-icon-svg" />
          </div>
          <div className="expense-card-info">
            <p className="expense-card-label">{t('totalExpenses', lang) || 'Total Expenses'}</p>
            <p className="expense-card-value">-{formatCurrency(totalExpenses, settings.currency)}</p>
          </div>
          <div className="expense-card-details">
            <span className="expense-count">{expenseEntries.length} {t('entries', lang)}</span>
            <span className="expense-month">{t('thisMonth', lang)}: -{formatCurrency(thisMonthExpenses, settings.currency)}</span>
          </div>
        </div>
      </div>

      <section className="quick-add">
        <button className="add-btn" onClick={onAddClick}>
          <PlusIcon className="add-icon" />
          <span>{t('addTransaction', lang)}</span>
        </button>
      </section>

      {/* Calendar Section */}
      <Calendar
        entries={entries}
        scheduledServices={scheduledServices}
        settings={settings}
        onAddService={onAddService}
        onDayClick={onDayClick}
      />

      <section className="entries-section">
        <div className="section-header">
          <h3>{t('recent', lang)}</h3>
          <button className="text-btn" onClick={onViewAll}>{t('viewAll', lang)} ({entries.length})</button>
        </div>
        <div className="entries-list">
          {entries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <p>{t('noIncomeYet', lang)}</p>
              <p className="empty-hint">{t('tapToAdd', lang)}</p>
            </div>
          ) : (
            recentIncomeEntries.map(entry => (
              <EntryItem
                key={entry.id}
                entry={entry}
                settings={settings}
                onEdit={() => onEditEntry(entry)}
                onDelete={() => onDeleteEntry(entry.id)}
                linkedExpenses={getLinkedExpenses(entry.id)}
                onEditExpense={onEditEntry}
                onDeleteExpense={onDeleteEntry}
              />
            ))
          )}
        </div>
      </section>
    </>
  )
}
