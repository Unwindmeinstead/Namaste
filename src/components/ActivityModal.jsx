import { CloseIcon, PlusIcon, EditIcon, TrashIcon, SettingsIcon, CalendarIcon } from './Icons'
import { t } from '../utils/translations'

const ACTIVITY_ICONS = {
  add_entry: PlusIcon,
  edit_entry: EditIcon,
  delete_entry: TrashIcon,
  add_schedule: CalendarIcon,
  edit_schedule: EditIcon,
  delete_schedule: TrashIcon,
  settings_change: SettingsIcon,
  clear_data: TrashIcon
}

const ACTIVITY_COLORS = {
  add_entry: 'var(--success)',
  edit_entry: 'var(--accent)',
  delete_entry: 'var(--danger)',
  add_schedule: 'var(--warning)',
  edit_schedule: 'var(--accent)',
  delete_schedule: 'var(--danger)',
  settings_change: 'var(--text-muted)',
  clear_data: 'var(--danger)'
}

export function ActivityModal({ isOpen, onClose, activities = [], settings }) {
  const lang = settings?.language || 'en'

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('justNow', lang) || 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getActivityText = (activity) => {
    const texts = {
      add_entry: t('activityAddEntry', lang) || 'Added transaction',
      edit_entry: t('activityEditEntry', lang) || 'Edited transaction',
      delete_entry: t('activityDeleteEntry', lang) || 'Deleted transaction',
      add_schedule: t('activityAddSchedule', lang) || 'Scheduled service',
      edit_schedule: t('activityEditSchedule', lang) || 'Updated schedule',
      delete_schedule: t('activityDeleteSchedule', lang) || 'Cancelled schedule',
      settings_change: t('activitySettingsChange', lang) || 'Changed settings',
      clear_data: t('activityClearData', lang) || 'Cleared all data'
    }
    return texts[activity.type] || activity.type
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(activity)
    return groups
  }, {})

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    if (dateStr === today) return t('today', lang) || 'Today'
    if (dateStr === yesterday) return t('yesterday', lang) || 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-full">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2>{t('recentActivity', lang) || 'Recent Activity'}</h2>
          <div></div>
        </div>

        <div className="activity-list">
          {activities.length === 0 ? (
            <div className="empty-activity">
              <p>{t('noActivity', lang) || 'No recent activity'}</p>
            </div>
          ) : (
            Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date} className="activity-group">
                <div className="activity-date-header">{formatDateHeader(date)}</div>
                {dayActivities.map(activity => {
                  const IconComponent = ACTIVITY_ICONS[activity.type] || PlusIcon
                  const iconColor = ACTIVITY_COLORS[activity.type] || 'var(--text-muted)'
                  
                  return (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon" style={{ color: iconColor }}>
                        <IconComponent className="activity-icon-svg" />
                      </div>
                      <div className="activity-info">
                        <span className="activity-text">{getActivityText(activity)}</span>
                        {activity.details && (
                          <span className="activity-details">{activity.details}</span>
                        )}
                      </div>
                      <span className="activity-time">{formatTime(activity.timestamp)}</span>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

