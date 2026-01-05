import { useState } from 'react'
import { CloseIcon, TrashIcon } from './Icons'
import { INCOME_CATEGORIES } from '../utils/categories'
import { getCategoryIcon } from './CategoryIcons'
import { t } from '../utils/translations'
import { formatCurrency } from '../utils/format'

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

export function ScheduleModal({ isOpen, onClose, onAdd, onDelete, settings, selectedDate, scheduledServices = [], entries = [] }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('teaching')
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0])
  const [hour, setHour] = useState('9')
  const [period, setPeriod] = useState('AM')
  const [address, setAddress] = useState('')
  const [poc, setPoc] = useState('')
  const [notes, setNotes] = useState('')

  const lang = settings.language || 'en'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd({
      id: Date.now().toString(),
      title: title.trim(),
      category,
      date,
      time: `${hour} ${period}`,
      address: address.trim(),
      poc: poc.trim(),
      notes: notes.trim(),
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
    setHour('9')
    setPeriod('AM')
    setAddress('')
    setPoc('')
    setNotes('')
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
                        <span className="day-entry-sub">
                          {service.time}
                          {service.poc && ` • ${service.poc}`}
                        </span>
                        {service.address && <span className="day-entry-address">{service.address}</span>}
                      </div>
                      <div className="day-entry-actions">
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

          <div className="form-group">
            <label>{t('date', lang)}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('time', lang) || 'Time'}</label>
            <div className="time-picker">
              <select 
                className="time-select hour"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <select 
                className="time-select period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t('poc', lang) || 'Point of Contact'}</label>
            <input
              type="text"
              placeholder={t('pocPlaceholder', lang) || 'Contact person name & phone'}
              value={poc}
              onChange={(e) => setPoc(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t('address', lang)}</label>
            <input
              type="text"
              placeholder={t('addressPlaceholder', lang) || 'Service location address'}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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

          <button type="submit" className="submit-btn">
            {t('scheduleService', lang) || 'Schedule Service'}
          </button>
        </form>
      </div>
    </div>
  )
}
