import { useState, useRef } from 'react'
import { CloseIcon, TrendUpIcon, TrendDownIcon, LocationIcon, CalendarIcon } from './Icons'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/categories'
import { getCategoryIcon } from './CategoryIcons'
import { t } from '../utils/translations'
import { formatCurrency, formatDate, toLocalDateString } from '../utils/format'
import { haptic } from '../utils/haptic'

const PAYMENT_METHODS = ['cash', 'applePay', 'check', 'bankTransfer', 'moneyOrder', 'otherPayment']
const IRS_MILEAGE_RATE = 0.67

export function AddModal({ isOpen, onClose, onAdd, settings, entries = [] }) {
  const today = toLocalDateString(new Date())
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [payerName, setPayerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(today)
  const [category, setCategory] = useState('saptahah')
  const [relatedTo, setRelatedTo] = useState('')
  const [address, setAddress] = useState('')
  
  // Mileage states (manual entry)
  const [miles, setMiles] = useState('')
  
  const dateInputRef = useRef(null)

  const lang = settings.language || 'en'
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  
  // Get recent income entries to link expenses to
  const recentJobs = entries
    .filter(e => e.type !== 'expense')
    .slice(0, 10)

  const mileageExpense = miles ? (parseFloat(miles) * IRS_MILEAGE_RATE).toFixed(2) : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) return

    const selectedCat = categories.find(c => c.id === category)
    
    onAdd({
      id: Date.now().toString(),
      type,
      amount: amountNum,
      payerName: type === 'income' ? payerName.trim() : '',
      paymentMethod: paymentMethod,
      source: source.trim() || (lang === 'hi' ? selectedCat?.nameHi : lang === 'ne' ? selectedCat?.nameNe : selectedCat?.name) || (type === 'income' ? 'Income' : 'Expense'),
      date,
      notes: '',
      category,
      relatedTo: type === 'expense' && relatedTo ? relatedTo : null,
      address: address.trim() || null,
      miles: type === 'expense' && miles ? parseFloat(miles) : null,
      createdAt: new Date().toISOString()
    })

    resetForm()
    onClose()
  }

  const resetForm = () => {
    setType('income')
    setAmount('')
    setPayerName('')
    setPaymentMethod('cash')
    setSource('')
    setDate(today)
    setCategory('saptahah')
    setRelatedTo('')
    setAddress('')
    setMiles('')
  }

  const handleClose = () => {
    haptic()
    resetForm()
    onClose()
  }

  const handleTypeChange = (newType) => {
    haptic()
    setType(newType)
    setCategory(newType === 'income' ? 'saptahah' : 'other_expense')
    if (newType === 'income') {
      setRelatedTo('')
      setMiles('')
    }
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
                autoFocus
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

          {/* Address field */}
          <div className="form-group">
            <label>{t('address', lang) || 'Address'}</label>
            <div className="address-input-wrap">
              <LocationIcon className="address-icon" />
              <input
                type="text"
                placeholder={t('addressPlaceholder', lang) || 'Service location address'}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Mileage - only for expenses */}
          {type === 'expense' && (
            <div className="form-group">
              <label>{t('mileage', lang) || 'Mileage'}</label>
              <div className="mileage-manual">
                <input
                  type="number"
                  placeholder="0"
                  value={miles}
                  onChange={(e) => setMiles(e.target.value)}
                  step="0.1"
                />
                <span className="miles-label">miles</span>
                {miles > 0 && (
                  <span className="mileage-calc">= {symbol}{mileageExpense} @ $0.67/mi</span>
                )}
              </div>
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
                    <span className="cat-name">{lang === 'hi' ? cat.nameHi : lang === 'ne' ? cat.nameNe : cat.name}</span>
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
            {t('saveEntry', lang)}
          </button>
        </form>
      </div>
    </div>
  )
}
