import { useState, useEffect, useRef } from 'react'
import { CloseIcon, TrashIcon, TrendUpIcon, TrendDownIcon, CalendarIcon } from './Icons'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/categories'
import { getCategoryIcon } from './CategoryIcons'
import { t } from '../utils/translations'
import { formatCurrency, formatDate } from '../utils/format'

const PAYMENT_METHODS = ['cash', 'applePay', 'check', 'bankTransfer', 'moneyOrder', 'otherPayment']

export function EditModal({ isOpen, entry, onClose, onSave, onDelete, settings, entries = [] }) {
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [payerName, setPayerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [source, setSource] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('saptahah')
  const [relatedTo, setRelatedTo] = useState('')
  
  const dateInputRef = useRef(null)

  const lang = settings.language || 'en'
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  
  const recentJobs = entries
    .filter(e => e.type !== 'expense' && e.id !== entry?.id)
    .slice(0, 10)

  useEffect(() => {
    if (entry) {
      setType(entry.type || 'income')
      setAmount(entry.amount.toString())
      setPayerName(entry.payerName || '')
      setPaymentMethod(entry.paymentMethod || 'cash')
      setSource(entry.source || '')
      setDate(entry.date)
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
      payerName: type === 'income' ? payerName.trim() : '',
      paymentMethod: paymentMethod,
      source: source.trim() || getCatName(selectedCat) || (type === 'income' ? 'Income' : 'Expense'),
      date,
      notes: entry.notes || '',
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
      setCategory('saptahah')
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

          {/* Payer Name - only for income */}
          {type === 'income' && (
            <div className="form-group">
              <label>{t('payerName', lang)}</label>
              <input
                type="text"
                placeholder={t('payerNamePlaceholder', lang)}
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
              />
            </div>
          )}

          {/* Payment Method */}
          <div className="form-group">
            <label>{t('paymentMethod', lang)}</label>
            <div className="payment-method-grid">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method}
                  type="button"
                  className={`payment-btn ${paymentMethod === method ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  {t(method, lang)}
                </button>
              ))}
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
                {recentJobs.map(job => {
                  const jobCat = INCOME_CATEGORIES.find(c => c.id === job.category)
                  const catName = lang === 'hi' ? jobCat?.nameHi : lang === 'ne' ? jobCat?.nameNe : jobCat?.name || 'Income'
                  return (
                    <option key={job.id} value={job.id}>
                      {catName}{job.payerName ? ` - ${job.payerName}` : ''} ({formatCurrency(job.amount, settings.currency)}, {formatDate(job.date)})
                    </option>
                  )
                })}
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
            <div 
              className="date-input-wrap"
              onClick={() => dateInputRef.current?.showPicker?.()}
            >
              <CalendarIcon className="date-icon" />
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  e.target.blur()
                }}
              />
            </div>
          </div>

          <button type="submit" className={`submit-btn ${type === 'expense' ? 'expense' : ''}`}>
            {t('saveChanges', lang)}
          </button>
        </form>
      </div>
    </div>
  )
}
