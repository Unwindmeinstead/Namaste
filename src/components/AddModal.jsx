import { useState } from 'react'
import { CloseIcon } from './Icons'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/categories'
import { t } from '../utils/translations'
import { formatCurrency, formatDate } from '../utils/format'

export function AddModal({ isOpen, onClose, onAdd, settings, entries = [] }) {
  const today = new Date().toISOString().split('T')[0]
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('other')
  const [relatedTo, setRelatedTo] = useState('')

  const lang = settings.language || 'en'
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  
  // Get recent income entries to link expenses to
  const recentJobs = entries
    .filter(e => e.type !== 'expense')
    .slice(0, 10)

  const handleSubmit = (e) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) return

    const selectedCat = categories.find(c => c.id === category)
    
    onAdd({
      id: Date.now().toString(),
      type,
      amount: amountNum,
      source: source.trim() || (lang === 'hi' ? selectedCat?.nameHi : lang === 'ne' ? selectedCat?.nameNe : selectedCat?.name) || (type === 'income' ? 'Income' : 'Expense'),
      date,
      notes: notes.trim(),
      category,
      relatedTo: type === 'expense' && relatedTo ? relatedTo : null,
      createdAt: new Date().toISOString()
    })

    resetForm()
    onClose()
  }

  const resetForm = () => {
    setType('income')
    setAmount('')
    setSource('')
    setDate(today)
    setNotes('')
    setCategory('other')
    setRelatedTo('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleTypeChange = (newType) => {
    setType(newType)
    setCategory(newType === 'income' ? 'other' : 'other_expense')
    if (newType === 'income') setRelatedTo('')
  }

  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  const symbol = symbols[settings.currency] || '$'

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <button className="close-btn" onClick={handleClose}>
            <CloseIcon />
          </button>
          <h2>{t('addEntry', lang)}</h2>
          <div></div>
        </div>

        <form className="income-form" onSubmit={handleSubmit}>
          {/* Income/Expense Toggle */}
          <div className="form-group">
            <label>{t('type', lang)}</label>
            <div className="type-toggle">
              <button 
                type="button"
                className={`type-btn income ${type === 'income' ? 'active' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                <span className="type-icon">💰</span>
                <span>{t('incomeType', lang)}</span>
              </button>
              <button 
                type="button"
                className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                <span className="type-icon">💸</span>
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
                autoFocus
                step="0.01"
              />
            </div>
          </div>

          {/* Link expense to job */}
          {type === 'expense' && recentJobs.length > 0 && (
            <div className="form-group">
              <label>{t('relatedJob', lang)}</label>
              <select 
                className="job-select"
                value={relatedTo} 
                onChange={(e) => setRelatedTo(e.target.value)}
              >
                <option value="">{t('selectJob', lang)}</option>
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
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-btn ${category === cat.id ? 'active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                  style={{ '--cat-color': cat.color }}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-name">{lang === 'hi' ? cat.nameHi : lang === 'ne' ? cat.nameNe : cat.name}</span>
                </button>
              ))}
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

          <div className="form-row">
            <div className="form-group flex-1">
              <label>{t('date', lang)}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
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
            {t('saveEntry', lang)}
          </button>
        </form>
      </div>
    </div>
  )
}
