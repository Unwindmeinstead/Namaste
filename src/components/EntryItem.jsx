import { useState } from 'react'
import { formatCurrency, formatDate } from '../utils/format'
import { getCategoryById } from '../utils/categories'
import { TrashIcon, EditIcon, ChevronRightIcon } from './Icons'
import { t } from '../utils/translations'

export function EntryItem({ entry, settings, onEdit, onDelete, showActions = true, linkedExpenses = [], onEditExpense, onDeleteExpense }) {
  const [expanded, setExpanded] = useState(false)
  const category = getCategoryById(entry.category)
  const isExpense = entry.type === 'expense'
  const lang = settings.language || 'en'
  
  const totalExpenses = linkedExpenses.reduce((sum, e) => sum + e.amount, 0)
  const hasExpenses = linkedExpenses.length > 0

  const getCatName = (cat) => {
    if (lang === 'hi') return cat.nameHi
    if (lang === 'ne') return cat.nameNe
    return cat.name
  }

  return (
    <div className={`entry-item-wrapper ${expanded ? 'expanded' : ''}`}>
      <div 
        className={`entry-item ${isExpense ? 'expense' : ''} ${hasExpenses ? 'has-expenses' : ''}`}
        onClick={() => hasExpenses ? setExpanded(!expanded) : (showActions && onEdit?.())}
      >
        <div className="entry-left">
          <div className="entry-emoji">{category.icon}</div>
          <div className="entry-info">
            <h4>{entry.source || getCatName(category)}</h4>
            <p>
              {formatDate(entry.date)}
              {entry.notes ? ` • ${entry.notes}` : ''}
              {hasExpenses && !expanded && (
                <span className="expense-badge">
                  {linkedExpenses.length} {t('jobExpenses', lang)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="entry-right">
          <div className="entry-amounts">
            <div className={`entry-amount ${isExpense ? 'expense' : ''}`}>
              {isExpense ? '-' : '+'}{formatCurrency(entry.amount, settings.currency)}
            </div>
            {hasExpenses && (
              <div className="entry-net">
                {t('netIncome', lang)}: {formatCurrency(entry.amount - totalExpenses, settings.currency)}
              </div>
            )}
          </div>
          {hasExpenses && (
            <ChevronRightIcon className={`expand-icon ${expanded ? 'expanded' : ''}`} />
          )}
          {showActions && !hasExpenses && (
            <div className="entry-actions">
              <button className="entry-action edit" onClick={(e) => { e.stopPropagation(); onEdit?.() }}>
                <EditIcon className="action-icon" />
              </button>
              <button className="entry-action delete" onClick={(e) => { e.stopPropagation(); onDelete?.() }}>
                <TrashIcon className="action-icon" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Linked Expenses */}
      {hasExpenses && expanded && (
        <div className="linked-expenses">
          <div className="expenses-header">
            <span>{t('jobExpenses', lang)} ({linkedExpenses.length})</span>
            <span className="expenses-total">-{formatCurrency(totalExpenses, settings.currency)}</span>
          </div>
          {linkedExpenses.map(expense => {
            const expCat = getCategoryById(expense.category)
            return (
              <div key={expense.id} className="expense-sub-item">
                <div className="expense-sub-left">
                  <span className="expense-sub-icon">{expCat.icon}</span>
                  <div className="expense-sub-info">
                    <span className="expense-sub-name">{expense.source || getCatName(expCat)}</span>
                    <span className="expense-sub-date">{formatDate(expense.date)}</span>
                  </div>
                </div>
                <div className="expense-sub-right">
                  <span className="expense-sub-amount">-{formatCurrency(expense.amount, settings.currency)}</span>
                  <div className="expense-sub-actions">
                    <button className="entry-action edit small" onClick={(e) => { e.stopPropagation(); onEditExpense?.(expense) }}>
                      <EditIcon className="action-icon" />
                    </button>
                    <button className="entry-action delete small" onClick={(e) => { e.stopPropagation(); onDeleteExpense?.(expense.id) }}>
                      <TrashIcon className="action-icon" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {/* Edit main entry button */}
          <button className="edit-main-entry" onClick={() => onEdit?.()}>
            <EditIcon className="action-icon" />
            <span>{t('editEntry', lang)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
