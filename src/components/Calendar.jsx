import { useState } from 'react'
import { ChevronRightIcon, BackIcon, PlusIcon } from './Icons'
import { t } from '../utils/translations'
import { toLocalDateString } from '../utils/format'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function Calendar({ entries, scheduledServices, settings, onAddService, onDayClick }) {
  const lang = settings.language || 'en'
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDay = firstDayOfMonth.getDay()
  const totalDays = lastDayOfMonth.getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get entries for a specific date
  const getEntriesForDate = (date) => {
    const dateStr = toLocalDateString(date)
    return entries.filter(e => e.date === dateStr && e.type !== 'expense')
  }

  // Get scheduled services for a specific date
  const getScheduledForDate = (date) => {
    const dateStr = toLocalDateString(date)
    return (scheduledServices || []).filter(s => s.date === dateStr)
  }

  // Check if date is today
  const isToday = (date) => {
    return date.toDateString() === today.toDateString()
  }

  // Check if date is in the past
  const isPast = (date) => {
    return date < today
  }

  // Check if date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === month
  }

  // Generate calendar days
  const generateDays = () => {
    const days = []
    
    // Previous month's days
    for (let i = 0; i < startingDay; i++) {
      const date = new Date(year, month, -startingDay + i + 1)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Current month's days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Next month's days to complete the grid
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }

  const days = generateDays()

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={prevMonth}>
          <BackIcon className="calendar-nav-icon" />
        </button>
        <div className="calendar-title" onClick={goToToday}>
          <span className="calendar-month">{MONTHS[month]}</span>
          <span className="calendar-year">{year}</span>
        </div>
        <button className="calendar-nav" onClick={nextMonth}>
          <ChevronRightIcon className="calendar-nav-icon" />
        </button>
      </div>

      <div className="calendar-days-header">
        {DAYS.map(day => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map(({ date, isCurrentMonth: isCurrent }, index) => {
          const dayEntries = getEntriesForDate(date)
          const dayScheduled = getScheduledForDate(date)
          const hasEntries = dayEntries.length > 0
          const hasScheduled = dayScheduled.length > 0
          const isTodayDate = isToday(date)
          const isPastDate = isPast(date)

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrent ? 'other-month' : ''} ${isTodayDate ? 'today' : ''} ${isPastDate && isCurrent ? 'past' : ''}`}
              onClick={() => onDayClick?.(date, dayEntries, dayScheduled)}
            >
              <span className="calendar-day-number">{date.getDate()}</span>
              <div className="calendar-day-indicators">
                {hasEntries && <span className="indicator entry-dot" title={`${dayEntries.length} entries`}></span>}
                {hasScheduled && <span className="indicator scheduled-dot" title={`${dayScheduled.length} scheduled`}></span>}
              </div>
            </div>
          )
        })}
      </div>

      <button className="calendar-add-btn" onClick={onAddService}>
        <PlusIcon className="calendar-add-icon" />
        <span>{t('scheduleService', lang) || 'Schedule Service'}</span>
      </button>
    </div>
  )
}

