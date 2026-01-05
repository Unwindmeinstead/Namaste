import { useState } from 'react'
import { CloseIcon, TrashIcon } from './Icons'
import { INCOME_CATEGORIES } from '../utils/categories'
import { getCategoryIcon } from './CategoryIcons'
import { t } from '../utils/translations'
import { formatCurrency } from '../utils/format'

export function ScheduleModal({ isOpen, onClose, onAdd, onDelete, settings, selectedDate, scheduledServices = [], entries = [] }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('teaching')
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [expectedAmount, setExpectedAmount] = useState('')

  const lang = settings.language || 'en'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd({
      id: Date.now().toString(),
      title: title.trim(),
      category,
      date,
      time,
      notes: notes.trim(),
      expectedAmount: expectedAmount ? parseFloat(expectedAmount) : null,
      completed: false,
      createdAt: new Date().toISOString()
    })

    resetForm()
    onClose()
  }

  const resetForm = () => {
    setTitle('')
    setCategory('teaching')
    setDate(selectedDate || new Date().toISOString().split('T')[0])
    setTime('')
    setNotes('')
    setExpectedAmount('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getCatName = (cat) => {
    if (lang === 'hi') return cat.nameHi
    if (lang === 'ne') return cat.nameNe
    return cat.name
  }

  // Get services for the selected date
  const dayServices = scheduledServices.filter(s => s.date === selectedDate)
  const dayEntries = entries.filter(e => e.date === selectedDate && e.type !== 'expense')

  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  const symbol = symbols[settings.currency] || '$'

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-content modal-full">
        <div className="modal-header">
          <button className="close-btn" onClick={handleClose}>
            <CloseIcon />
          </button>
          <h2>{selectedDate ? formatDateDisplay(selectedDate) : (t('scheduleService', lang) || 'Schedule Service')}</h2>
          <div></div>
        </div>

        {/* Show existing entries for this date */}
        {selectedDate && (dayEntries.length > 0 || dayServices.length > 0) && (
          <div className="day-summary">
            {dayEntries.length > 0 && (
              <div className="day-section">
                <h4 className="day-section-title">{t('completedServices', lang) || 'Completed Services'}</h4>
                {dayEntries.map(entry => {
                  const cat = INCOME_CATEGORIES.find(c => c.id === entry.category) || INCOME_CATEGORIES[0]
                  const CatIcon = getCategoryIcon(entry.category)
                  return (
                    <div key={entry.id} className="day-entry completed">
                      <CatIcon className="day-entry-icon" />
                      <div className="day-entry-info">
                        <span className="day-entry-title">{entry.source}</span>
                        {entry.payerName && <span className="day-entry-sub">{entry.payerName}</span>}
                      </div>
                      <span className="day-entry-amount">+{formatCurrency(entry.amount, settings.currency)}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {dayServices.length > 0 && (
              <div className="day-section">
                <h4 className="day-section-title">{t('scheduledServices', lang) || 'Scheduled Services'}</h4>
                {dayServices.map(service => {
                  const CatIcon = getCategoryIcon(service.category)
                  return (
                    <div key={service.id} className="day-entry scheduled">
                      <CatIcon className="day-entry-icon" />
                      <div className="day-entry-info">
                        <span className="day-entry-title">{service.title}</span>
                        {service.time && <span className="day-entry-sub">{service.time}</span>}
                      </div>
                      <div className="day-entry-actions">
                        {service.expectedAmount && (
                          <span className="day-entry-expected">~{formatCurrency(service.expectedAmount, settings.currency)}</span>
                        )}
                        <button className="day-entry-delete" onClick={() => onDelete(service.id)}>
                          <TrashIcon className="day-entry-delete-icon" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="schedule-form-divider">
          <span>{t('addNewSchedule', lang) || 'Add New Schedule'}</span>
        </div>

        <form className="income-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('serviceTitle', lang) || 'Service Title'}</label>
            <input
              type="text"
              placeholder={t('serviceTitlePlaceholder', lang) || 'e.g., Teaching session with Mr. Sharma'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('category', lang)}</label>
            <div className="category-grid">
              {INCOME_CATEGORIES.map(cat => {
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

          <div className="form-row">
            <div className="form-group flex-1">
              <label>{t('date', lang)}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label>{t('time', lang) || 'Time'}</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('expectedAmount', lang) || 'Expected Amount (optional)'}</label>
            <div className="amount-input-wrap small">
              <span className="currency">{symbol}</span>
              <input
                type="number"
                placeholder="0"
                value={expectedAmount}
                onChange={(e) => setExpectedAmount(e.target.value)}
                step="0.01"
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

          <button type="submit" className="submit-btn">
            {t('scheduleService', lang) || 'Schedule Service'}
          </button>
        </form>
      </div>
    </div>
  )
}

