import { ClockIcon, UserIcon, PlusIcon, TrendUpIcon, TrendDownIcon } from '../components/Icons'

// Kalash Logo Component
const KalashLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 60 70" fill="currentColor">
    {/* Flames */}
    <path d="M30 0 C33 4, 35 8, 30 12 C25 8, 27 4, 30 0Z"/>
    <path d="M24 3 C26 6, 27 9, 24 12 C21 9, 22 6, 24 3Z"/>
    <path d="M36 3 C38 6, 39 9, 36 12 C33 9, 34 6, 36 3Z"/>
    {/* Coconut */}
    <ellipse cx="30" cy="18" rx="9" ry="7"/>
    {/* Leaves left */}
    <path d="M21 24 C14 20, 6 22, 2 14 C10 18, 18 18, 21 24Z"/>
    <path d="M21 28 C12 26, 4 30, 0 24 C8 26, 16 24, 21 28Z"/>
    {/* Leaves right */}
    <path d="M39 24 C46 20, 54 22, 58 14 C50 18, 42 18, 39 24Z"/>
    <path d="M39 28 C48 26, 56 30, 60 24 C52 26, 44 24, 39 28Z"/>
    {/* Neck band */}
    <rect x="22" y="30" width="16" height="7" rx="1"/>
    {/* Beads on neck */}
    <circle cx="26" cy="33.5" r="1.5" fill="#0a0a0a"/>
    <circle cx="30" cy="33.5" r="1.5" fill="#0a0a0a"/>
    <circle cx="34" cy="33.5" r="1.5" fill="#0a0a0a"/>
    {/* Pot body */}
    <path d="M21 37 Q14 48, 17 62 Q24 70, 30 70 Q36 70, 43 62 Q46 48, 39 37 Z"/>
    {/* Lotus on pot */}
    <path d="M22 56 C26 52, 34 52, 38 56 C34 53, 26 53, 22 56Z" fill="#0a0a0a"/>
    {/* Diamond */}
    <path d="M30 44 L34 50 L30 56 L26 50 Z" fill="#0a0a0a"/>
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
          <KalashLogo className="header-logo" />
          <span className="header-brand-name">
            <span className="brand-d">द</span>akshina
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
