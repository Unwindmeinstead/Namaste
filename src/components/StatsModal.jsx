import { useState, useEffect } from 'react'
import { CloseIcon, TrendUpIcon, TrendDownIcon } from './Icons'
import { formatCurrency, formatDate, getMonthFullName } from '../utils/format'
import { getCategoryById } from '../utils/categories'
import { getCategoryIcon } from './CategoryIcons'
import { t } from '../utils/translations'
import { haptic } from '../utils/haptic'

export function StatsModal({ isOpen, onClose, type, entries, settings, title }) {
  const lang = settings?.language || 'en'
  const [activeTab, setActiveTab] = useState('all')
  
  if (!isOpen) return null

  // Filter entries based on type
  const incomeEntries = entries.filter(e => e.type !== 'expense')
  const expenseEntries = entries.filter(e => e.type === 'expense')
  
  const displayEntries = activeTab === 'all' 
    ? entries 
    : activeTab === 'income' 
      ? incomeEntries 
      : expenseEntries

  // Sort by date (newest first)
  const sortedEntries = [...displayEntries].sort((a, b) => new Date(b.date) - new Date(a.date))
  
  // Calculate totals
  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
  const netAmount = totalIncome - totalExpenses

  // Group by category
  const byCategory = displayEntries.reduce((acc, e) => {
    const catId = e.category || (e.type === 'expense' ? 'other_expense' : 'other')
    if (!acc[catId]) {
      const cat = getCategoryById(catId)
      acc[catId] = { id: catId, name: cat?.name || catId, total: 0, count: 0, color: cat?.color }
    }
    acc[catId].total += e.amount
    acc[catId].count++
    return acc
  }, {})
  
  const categoryData = Object.values(byCategory).sort((a, b) => b.total - a.total)

  return (
    <div className="stats-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="stats-modal">
        {/* Header */}
        <div className="stats-modal-header">
          <button className="stats-close-btn" onClick={() => { haptic(); onClose() }}>
            <CloseIcon />
          </button>
          <h2 className="stats-modal-title">{title}</h2>
          <div></div>
        </div>

        {/* Summary Cards */}
        <div className="stats-summary">
          <div className="stats-summary-card income">
            <TrendUpIcon className="stats-summary-icon" />
            <div className="stats-summary-info">
              <span className="stats-summary-label">{t('income', lang) || 'Income'}</span>
              <span className="stats-summary-value">+{formatCurrency(totalIncome, settings.currency)}</span>
            </div>
          </div>
          <div className="stats-summary-card expense">
            <TrendDownIcon className="stats-summary-icon" />
            <div className="stats-summary-info">
              <span className="stats-summary-label">{t('expenses', lang) || 'Expenses'}</span>
              <span className="stats-summary-value">-{formatCurrency(totalExpenses, settings.currency)}</span>
            </div>
          </div>
          <div className={`stats-summary-card net ${netAmount < 0 ? 'negative' : ''}`}>
            <div className="stats-summary-info full">
              <span className="stats-summary-label">{t('net', lang) || 'Net'}</span>
              <span className="stats-summary-value">{netAmount < 0 ? '-' : '+'}{formatCurrency(Math.abs(netAmount), settings.currency)}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="stats-tabs">
          <button 
            className={`stats-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { haptic(); setActiveTab('all') }}
          >
            {t('all', lang) || 'All'} ({entries.length})
          </button>
          <button 
            className={`stats-tab ${activeTab === 'income' ? 'active' : ''}`}
            onClick={() => { haptic(); setActiveTab('income') }}
          >
            {t('income', lang) || 'Income'} ({incomeEntries.length})
          </button>
          <button 
            className={`stats-tab ${activeTab === 'expense' ? 'active' : ''}`}
            onClick={() => { haptic(); setActiveTab('expense') }}
          >
            {t('expenses', lang) || 'Expenses'} ({expenseEntries.length})
          </button>
        </div>

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <div className="stats-categories">
            <h4 className="stats-section-title">{t('byCategory', lang) || 'By Category'}</h4>
            <div className="stats-category-list">
              {categoryData.slice(0, 5).map(cat => {
                const CatIcon = getCategoryIcon(cat.id)
                const maxTotal = categoryData[0]?.total || 1
                return (
                  <div key={cat.id} className="stats-category-item">
                    <div className="stats-cat-header">
                      <div className="stats-cat-icon" style={{ background: cat.color + '20' }}>
                        <CatIcon style={{ color: cat.color }} />
                      </div>
                      <span className="stats-cat-name">{cat.name}</span>
                      <span className="stats-cat-count">{cat.count}</span>
                    </div>
                    <div className="stats-cat-bar-wrap">
                      <div 
                        className="stats-cat-bar" 
                        style={{ 
                          width: `${(cat.total / maxTotal) * 100}%`,
                          background: cat.color
                        }}
                      />
                    </div>
                    <span className="stats-cat-total">
                      {activeTab === 'expense' ? '-' : ''}{formatCurrency(cat.total, settings.currency)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="stats-entries">
          <h4 className="stats-section-title">
            {t('transactions', lang) || 'Transactions'} ({sortedEntries.length})
          </h4>
          <div className="stats-entries-list">
            {sortedEntries.length === 0 ? (
              <div className="stats-empty">
                <p>{t('noEntriesForPeriod', lang) || 'No entries for this period'}</p>
              </div>
            ) : (
              sortedEntries.map(entry => {
                const cat = getCategoryById(entry.category)
                const CatIcon = getCategoryIcon(entry.category)
                const isExpense = entry.type === 'expense'
                return (
                  <div key={entry.id} className="stats-entry-item">
                    <div className="stats-entry-icon" style={{ background: cat?.color + '15' }}>
                      <CatIcon style={{ color: cat?.color }} />
                    </div>
                    <div className="stats-entry-info">
                      <span className="stats-entry-source">{entry.source || entry.payerName || cat?.name || 'Entry'}</span>
                      <span className="stats-entry-date">{formatDate(entry.date)}</span>
                    </div>
                    <span className={`stats-entry-amount ${isExpense ? 'expense' : 'income'}`}>
                      {isExpense ? '-' : '+'}{formatCurrency(entry.amount, settings.currency)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
