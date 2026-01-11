import { ClockIcon, UserIcon, PlusIcon, TrendUpIcon, TrendDownIcon } from '../components/Icons'

// Kalash Logo Component - matching the provided image exactly
const KalashLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 100 120" fill="currentColor">
    {/* Three flames at top */}
    <path d="M50 0 C54 6, 56 12, 50 18 C44 12, 46 6, 50 0Z"/>
    <path d="M40 5 C43 10, 44 14, 40 18 C36 14, 37 10, 40 5Z"/>
    <path d="M60 5 C63 10, 64 14, 60 18 C56 14, 57 10, 60 5Z"/>
    
    {/* Coconut/bulb with horizontal lines */}
    <ellipse cx="50" cy="30" rx="14" ry="12"/>
    <path d="M38 26 Q50 34, 62 26" stroke="var(--bg-primary, #0a0a0a)" strokeWidth="2" fill="none"/>
    <path d="M40 32 Q50 38, 60 32" stroke="var(--bg-primary, #0a0a0a)" strokeWidth="2" fill="none"/>
    
    {/* Large lotus petals - left side (3 petals) */}
    <path d="M36 40 C28 32, 14 32, 4 20 Q16 32, 32 38 Z"/>
    <path d="M36 44 C24 40, 8 44, 0 36 Q14 42, 32 44 Z"/>
    <path d="M36 50 C26 50, 12 56, 4 52 Q18 52, 34 50 Z"/>
    
    {/* Large lotus petals - right side (3 petals) */}
    <path d="M64 40 C72 32, 86 32, 96 20 Q84 32, 68 38 Z"/>
    <path d="M64 44 C76 40, 92 44, 100 36 Q86 42, 68 44 Z"/>
    <path d="M64 50 C74 50, 88 56, 96 52 Q82 52, 66 50 Z"/>
    
    {/* Decorated neck band */}
    <rect x="35" y="52" width="30" height="10" rx="2"/>
    <circle cx="42" cy="57" r="2.5" fill="var(--bg-primary, #0a0a0a)"/>
    <circle cx="50" cy="57" r="2.5" fill="var(--bg-primary, #0a0a0a)"/>
    <circle cx="58" cy="57" r="2.5" fill="var(--bg-primary, #0a0a0a)"/>
    
    {/* Hanging bead strings - left */}
    <circle cx="33" cy="66" r="2.5"/>
    <circle cx="30" cy="74" r="2.5"/>
    <circle cx="28" cy="82" r="2.5"/>
    
    {/* Hanging bead strings - right */}
    <circle cx="67" cy="66" r="2.5"/>
    <circle cx="70" cy="74" r="2.5"/>
    <circle cx="72" cy="82" r="2.5"/>
    
    {/* Pot body - rounded kalash shape */}
    <path d="M34 62 Q22 78, 26 100 Q36 114, 50 116 Q64 114, 74 100 Q78 78, 66 62 L66 62 Q58 62, 50 62 Q42 62, 34 62Z"/>
    
    {/* Diamond decoration in center */}
    <path d="M50 72 L56 82 L50 92 L44 82 Z" fill="var(--bg-primary, #0a0a0a)"/>
    
    {/* Lotus petals at bottom of pot */}
    <path d="M32 98 C40 90, 60 90, 68 98" stroke="var(--bg-primary, #0a0a0a)" strokeWidth="2.5" fill="none"/>
    <path d="M36 106 C44 100, 56 100, 64 106" stroke="var(--bg-primary, #0a0a0a)" strokeWidth="2.5" fill="none"/>
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
