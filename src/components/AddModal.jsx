import { useState, useRef, useEffect } from 'react'
import { CloseIcon, TrendUpIcon, TrendDownIcon, LocationIcon, CalendarIcon } from './Icons'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/categories'
import { getCategoryIcon } from './CategoryIcons'
import { t } from '../utils/translations'
import { formatCurrency, formatDate, toLocalDateString } from '../utils/format'
import { haptic } from '../utils/haptic'

// Microphone Icon
const MicIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)

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
  
  // Voice input states
  const [isListening, setIsListening] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const recognitionRef = useRef(null)
  
  const dateInputRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = settings?.language === 'ne' ? 'ne-NP' : settings?.language === 'hi' ? 'hi-IN' : 'en-US'
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        setVoiceText(transcript)
        parseVoiceInput(transcript)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [settings?.language])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      haptic('medium')
      setIsListening(true)
      setVoiceText('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      haptic()
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const parseVoiceInput = (text) => {
    const lower = text.toLowerCase()
    
    // Extract amount (look for numbers)
    const amountMatch = lower.match(/(\d+(?:\.\d{2})?)\s*(?:dollars?|rupees?|\$|₹)?/)
    if (amountMatch) {
      setAmount(amountMatch[1])
    }
    
    // Extract payer name (look for "from" keyword)
    const fromMatch = lower.match(/from\s+([a-zA-Z\s]+?)(?:\s+for|\s+at|\s*$)/i)
    if (fromMatch) {
      setPayerName(fromMatch[1].trim())
    }
    
    // Check for expense keywords
    if (lower.includes('expense') || lower.includes('spent') || lower.includes('paid for')) {
      setType('expense')
    }
    
    // Check for income keywords
    if (lower.includes('received') || lower.includes('earned') || lower.includes('income')) {
      setType('income')
    }
    
    // Set source/description (use remaining text)
    const forMatch = lower.match(/for\s+(.+?)(?:\s+from|\s*$)/i)
    if (forMatch) {
      setSource(forMatch[1].trim())
    }
  }

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
          <button 
            type="button"
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            title={t('voiceEntry', lang) || 'Voice Entry'}
          >
            <MicIcon />
          </button>
        </div>

        {/* Voice Input Display */}
        {(isListening || voiceText) && (
          <div className={`voice-status ${isListening ? 'active' : ''}`}>
            <div className="voice-indicator">
              {isListening && <span className="voice-pulse" />}
              <MicIcon className="voice-status-icon" />
            </div>
            <div className="voice-text">
              {isListening ? (voiceText || (t('listening', lang) || 'Listening...')) : voiceText}
            </div>
            {voiceText && !isListening && (
              <button type="button" className="voice-clear" onClick={() => setVoiceText('')}>
                <CloseIcon />
              </button>
            )}
          </div>
        )}

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
