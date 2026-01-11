import { useState, useEffect, useRef } from 'react'
import { CloseIcon, TrashIcon, EditIcon, BackIcon, CalendarIcon } from './Icons'
import { INCOME_CATEGORIES } from '../utils/categories'
import { getCategoryIcon } from './CategoryIcons'
import { t } from '../utils/translations'
import { formatCurrency, toLocalDateString } from '../utils/format'

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

export function ScheduleModal({ isOpen, onClose, onAdd, onUpdate, onDelete, settings, selectedDate, scheduledServices = [], entries = [] }) {
  const [mode, setMode] = useState('view') // 'view', 'add', 'edit'
  const [editingService, setEditingService] = useState(null)
  
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('saptahah')
  const [date, setDate] = useState(selectedDate || toLocalDateString(new Date()))
  const [hour, setHour] = useState('9')
  const [period, setPeriod] = useState('AM')
  const [address, setAddress] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  
  const dateInputRef = useRef(null)

  const lang = settings.language || 'en'

  // Get services for the selected date
  const dayServices = scheduledServices.filter(s => s.date === selectedDate)
  const dayEntries = entries.filter(e => e.date === selectedDate && e.type !== 'expense')

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedDate) {
        // If clicking on a specific day with services, show view mode
        if (dayServices.length > 0) {
          setMode('view')
        } else {
          setMode('add')
        }
        setDate(selectedDate)
      } else {
        // If clicking "Schedule Service" button directly, go to add mode
        setMode('add')
        setDate(toLocalDateString(new Date()))
      }
    }
  }, [isOpen, selectedDate])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const serviceData = {
      title: title.trim(),
      category,
      date,
      time: `${hour} ${period}`,
      address: address.trim(),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      notes: notes.trim(),
      completed: false
    }

    if (mode === 'edit' && editingService) {
      onUpdate?.({
        ...editingService,
        ...serviceData,
        updatedAt: new Date().toISOString()
      })
    } else {
      onAdd({
        id: Date.now().toString(),
        ...serviceData,
        createdAt: new Date().toISOString()
      })
    }

    resetForm()
    if (dayServices.length > 0 || mode === 'edit') {
      setMode('view')
    } else {
      onClose()
    }
  }

  const resetForm = () => {
    setTitle('')
    setCategory('saptahah')
    setDate(selectedDate || toLocalDateString(new Date()))
    setHour('9')
    setPeriod('AM')
    setAddress('')
    setContactName('')
    setContactPhone('')
    setNotes('')
    setEditingService(null)
  }

  const handleClose = () => {
    resetForm()
    setMode('view')
    onClose()
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setTitle(service.title || '')
    setCategory(service.category || 'teaching')
    setDate(service.date || selectedDate)
    
    // Parse time
    if (service.time) {
      const parts = service.time.split(' ')
      setHour(parts[0] || '9')
      setPeriod(parts[1] || 'AM')
    }
    
    setAddress(service.address || '')
    setContactName(service.contactName || service.poc || '')
    setContactPhone(service.contactPhone || '')
    setNotes(service.notes || '')
    setMode('edit')
  }

  const handleAddNew = () => {
    resetForm()
    setMode('add')
  }

  const handleBack = () => {
    resetForm()
    setMode('view')
  }

  const getCatName = (cat) => {
    if (lang === 'hi') return cat.nameHi
    if (lang === 'ne') return cat.nameNe
    return cat.name
  }

  const formatDateDisplay = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  // View Mode - Show scheduled services
  const renderViewMode = () => (
    <>
      <div className="modal-header">
        <button className="close-btn" onClick={handleClose}>
          <CloseIcon />
        </button>
        <h2>{selectedDate ? formatDateDisplay(selectedDate) : (t('scheduledServices', lang) || 'Scheduled')}</h2>
        <div></div>
      </div>

      <div className="scheduled-list">
        {dayServices.length === 0 ? (
          <div className="empty-schedule">
            <p>{t('noScheduled', lang) || 'No scheduled services'}</p>
          </div>
        ) : (
          dayServices.map(service => {
            const CatIcon = getCategoryIcon(service.category)
            return (
              <div key={service.id} className="scheduled-card">
                <div className="scheduled-card-header">
                  <CatIcon className="scheduled-card-icon" />
                  <div className="scheduled-card-title-wrap">
                    <h4>{service.title}</h4>
                  </div>
                  <div className="scheduled-card-actions">
                    <button className="scheduled-action edit" onClick={() => handleEdit(service)}>
                      <EditIcon className="action-icon" />
                    </button>
                    <button className="scheduled-action delete" onClick={() => onDelete(service.id)}>
                      <TrashIcon className="action-icon" />
                    </button>
                  </div>
                </div>
                
                <div className="scheduled-card-details">
                  <div className="detail-row">
                    <span className="detail-label">{t('time', lang) || 'Time'}</span>
                    <span className="detail-value time-value">{service.time}</span>
                  </div>
                  
                  {service.contactName && (
                    <div className="detail-row">
                      <span className="detail-label">{t('contactName', lang) || 'Contact'}</span>
                      <span className="detail-value">{service.contactName}</span>
                    </div>
                  )}
                  
                  {service.contactPhone && (
                    <div className="detail-row">
                      <span className="detail-label">{t('contactPhone', lang) || 'Phone'}</span>
                      <span className="detail-value phone-value">{service.contactPhone}</span>
                    </div>
                  )}
                  
                  {service.address && (
                    <div className="detail-row">
                      <span className="detail-label">{t('address', lang) || 'Address'}</span>
                      <span className="detail-value">{service.address}</span>
                    </div>
                  )}
                  
                  {service.notes && (
                    <div className="detail-row">
                      <span className="detail-label">{t('notes', lang) || 'Notes'}</span>
                      <span className="detail-value notes-value">{service.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <button className="add-schedule-btn" onClick={handleAddNew}>
        + {t('addNewSchedule', lang) || 'Add New Schedule'}
      </button>
    </>
  )

  // Add/Edit Form Mode
  const renderFormMode = () => (
    <>
      <div className="modal-header">
        {mode === 'edit' || dayServices.length > 0 ? (
          <button className="close-btn" onClick={handleBack}>
            <BackIcon />
          </button>
        ) : (
          <button className="close-btn" onClick={handleClose}>
            <CloseIcon />
          </button>
        )}
        <h2>{mode === 'edit' ? (t('editSchedule', lang) || 'Edit Schedule') : (t('addNewSchedule', lang) || 'Add Schedule')}</h2>
        <div></div>
      </div>

      <form className="income-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t('serviceTitle', lang) || 'Service Title'}</label>
          <input
            type="text"
            placeholder={t('serviceTitlePlaceholder', lang) || 'e.g., Teaching session'}
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
              required
            />
          </div>
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
          <label>{t('contactName', lang) || 'Contact Name'}</label>
          <input
            type="text"
            placeholder={t('contactNamePlaceholder', lang) || 'Contact person name'}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{t('contactPhone', lang) || 'Phone Number'}</label>
          <input
            type="tel"
            placeholder={t('contactPhonePlaceholder', lang) || 'Phone number'}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
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
          {mode === 'edit' ? (t('saveChanges', lang) || 'Save Changes') : (t('scheduleService', lang) || 'Schedule Service')}
        </button>
      </form>
    </>
  )

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-content modal-full">
        {mode === 'view' ? renderViewMode() : renderFormMode()}
      </div>
    </div>
  )
}
