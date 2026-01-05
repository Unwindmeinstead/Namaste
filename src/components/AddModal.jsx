import { useState } from 'react'
import { CloseIcon, TrendUpIcon, TrendDownIcon, LocationIcon } from './Icons'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/categories'
import { getCategoryIcon } from './CategoryIcons'
import { t } from '../utils/translations'
import { formatCurrency, formatDate } from '../utils/format'
import { calculateMiles, calculateMileageExpense, DEFAULT_HOME_ADDRESS } from '../utils/mileage'

const PAYMENT_METHODS = ['cash', 'check', 'card', 'bankTransfer', 'upi', 'otherPayment']

// Car icon for mileage
const CarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2"/>
    <circle cx="6.5" cy="16.5" r="2.5"/>
    <circle cx="16.5" cy="16.5" r="2.5"/>
  </svg>
)

export function AddModal({ isOpen, onClose, onAdd, settings, entries = [] }) {
  const today = new Date().toISOString().split('T')[0]
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [payerName, setPayerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('other')
  const [relatedTo, setRelatedTo] = useState('')
  
  // Mileage states
  const [destinationAddress, setDestinationAddress] = useState('')
  const [miles, setMiles] = useState(0)
  const [mileageExpense, setMileageExpense] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [mileageError, setMileageError] = useState('')

  const lang = settings.language || 'en'
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  
  // Get recent income entries to link expenses to
  const recentJobs = entries
    .filter(e => e.type !== 'expense')
    .slice(0, 10)

  const handleCalculateMiles = async () => {
    if (!destinationAddress.trim()) {
      setMileageError(t('enterDestination', lang) || 'Enter a destination address')
      return
    }

    setIsCalculating(true)
    setMileageError('')

    const result = await calculateMiles(destinationAddress)
    
    setIsCalculating(false)

    if (result.error) {
      setMileageError(result.error)
      setMiles(0)
      setMileageExpense(0)
    } else {
      setMiles(result.miles)
      const expense = calculateMileageExpense(result.miles)
      setMileageExpense(expense)
      // Auto-fill amount if empty
      if (!amount) {
        setAmount(expense.toString())
      }
    }
  }

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
      notes: notes.trim(),
      category,
      relatedTo: type === 'expense' && relatedTo ? relatedTo : null,
      // Mileage data for expenses
      miles: type === 'expense' && miles > 0 ? miles : null,
      destinationAddress: type === 'expense' && destinationAddress.trim() ? destinationAddress.trim() : null,
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
    setNotes('')
    setCategory('other')
    setRelatedTo('')
    setDestinationAddress('')
    setMiles(0)
    setMileageExpense(0)
    setMileageError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleTypeChange = (newType) => {
    setType(newType)
    setCategory(newType === 'income' ? 'other' : 'other_expense')
    if (newType === 'income') {
      setRelatedTo('')
      setDestinationAddress('')
      setMiles(0)
      setMileageExpense(0)
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

          {/* Mileage Calculator - only for expenses */}
          {type === 'expense' && (
            <div className="form-group mileage-section">
              <label>
                <CarIcon className="label-icon" />
                {t('mileageCalculator', lang) || 'Mileage Calculator'}
              </label>
              <div className="mileage-home">
                <LocationIcon className="mileage-icon home" />
                <span>{t('from', lang) || 'From'}: {DEFAULT_HOME_ADDRESS}</span>
              </div>
              <div className="mileage-input-row">
                <div className="mileage-input-wrap">
                  <LocationIcon className="mileage-icon dest" />
                  <input
                    type="text"
                    placeholder={t('destinationAddress', lang) || 'Destination address'}
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                  />
                </div>
                <button 
                  type="button" 
                  className="calc-miles-btn"
                  onClick={handleCalculateMiles}
                  disabled={isCalculating}
                >
                  {isCalculating ? '...' : (t('calculate', lang) || 'Calc')}
                </button>
              </div>
              {mileageError && <p className="mileage-error">{mileageError}</p>}
              {miles > 0 && (
                <div className="mileage-result">
                  <div className="mileage-stat">
                    <span className="mileage-label">{t('distance', lang) || 'Distance'}</span>
                    <span className="mileage-value">{miles} {t('miles', lang) || 'miles'}</span>
                  </div>
                  <div className="mileage-stat">
                    <span className="mileage-label">{t('atIrsRate', lang) || '@$0.67/mi'}</span>
                    <span className="mileage-value expense">{symbol}{mileageExpense}</span>
                  </div>
                </div>
              )}
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
            {t('saveEntry', lang)}
          </button>
        </form>
      </div>
    </div>
  )
}
