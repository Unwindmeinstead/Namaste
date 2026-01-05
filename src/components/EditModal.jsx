import { useState, useEffect } from 'react'
import { CloseIcon, TrashIcon, TrendUpIcon, TrendDownIcon } from './Icons'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/categories'
import { getCategoryIcon } from './CategoryIcons'
import { t } from '../utils/translations'
import { formatCurrency, formatDate } from '../utils/format'

export function EditModal({ isOpen, entry, onClose, onSave, onDelete, settings, entries = [] }) {
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('other')
  const [relatedTo, setRelatedTo] = useState('')

  const lang = settings.language || 'en'
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  
  const recentJobs = entries
    .filter(e => e.type !== 'expense' && e.id !== entry?.id)
    .slice(0, 10)

  useEffect(() => {
    if (entry) {
      setType(entry.type || 'income')
      setAmount(entry.amount.toString())
      setSource(entry.source || '')
      setDate(entry.date)
      setNotes(entry.notes || '')
      setCategory(entry.category || 'other')
      setRelatedTo(entry.relatedTo || '')
    }
  }, [entry])

  const getCatName = (cat) => {
    if (lang === 'hi') return cat.nameHi
    if (lang === 'ne') return cat.nameNe
    return cat.name
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) return

    const selectedCat = categories.find(c => c.id === category)

    onSave({
      ...entry,
      type,
      amount: amountNum,
      source: source.trim() || getCatName(selectedCat) || (type === 'income' ? 'Income' : 'Expense'),
      date,
      notes: notes.trim(),
      category,
      relatedTo: type === 'expense' && relatedTo ? relatedTo : null,
      updatedAt: new Date().toISOString()
    })
  }

  const handleDelete = () => {
    if (confirm(t('deleteEntry', lang))) {
      onDelete(entry.id)
      onClose()
    }
  }

  const handleTypeChange = (newType) => {
    setType(newType)
    if (newType === 'income' && EXPENSE_CATEGORIES.find(c => c.id === category)) {
      setCategory('other')
      setRelatedTo('')
    } else if (newType === 'expense' && INCOME_CATEGORIES.find(c => c.id === category)) {
      setCategory('other_expense')
    }
  }

  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  const symbol = symbols[settings.currency] || '$'

  if (!entry) return null

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2>{t('editEntry', lang)}</h2>
          <button className="delete-header-btn" onClick={handleDelete}>
            <TrashIcon className="delete-icon" />
          </button>
        </div>

        <form className="income-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('type', lang)}</label>
            <div className="type-toggle">
              <button 
                type="button"
                className={`type-btn income ${type === 'income' ? 'active' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                <TrendUpIcon className="type-icon-svg" />
                <span>{t('incomeType', lang)}</span>
              </button>
              <button 
                type="button"
                className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                <TrendDownIcon className="type-icon-svg" />
                <span>{t('expenseType', lang)}</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>{t('amount', lang)}</label>
            <div className="amount-input-wrap">
              <span className="currency">{symbol}</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                step="0.01"
              />
            </div>
          </div>

          {type === 'expense' && recentJobs.length > 0 && (
            <div className="form-group">
              <label>{t('relatedJob', lang)}</label>
              <select 
                className="job-select"
                value={relatedTo} 
                onChange={(e) => setRelatedTo(e.target.value)}
              >
                <option value="">{t('none', lang)}</option>
                {recentJobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.source} - {formatCurrency(job.amount, settings.currency)} ({formatDate(job.date)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>{t('category', lang)}</label>
            <div className="category-grid">
              {categories.map(cat => {
                const CatIcon = getCategoryIcon(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-btn ${category === cat.id ? 'active' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <CatIcon className="cat-icon" />
                    <span className="cat-name">{getCatName(cat)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="form-group">
            <label>{t('sourceOptional', lang)}</label>
            <input
              type="text"
              placeholder={t('customDescription', lang)}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t('date', lang)}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t('notesOptional', lang)}</label>
            <input
              type="text"
              placeholder={t('additionalDetails', lang)}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className={`submit-btn ${type === 'expense' ? 'expense' : ''}`}>
            {t('saveChanges', lang)}
          </button>
        </form>
      </div>
    </div>
  )
}
