import { useState } from 'react'
import { ChevronRightIcon, TrashIcon, DownloadIcon, UserIcon, EmailIcon, PhoneIcon, LocationIcon, FileIcon, LockIcon, ShieldIcon } from '../components/Icons'
import { downloadCSV } from '../utils/format'
import { t } from '../utils/translations'
import { PinLock } from '../components/PinLock'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
]

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' }
]

// Cloud icon
const CloudIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
  </svg>
)

export function SettingsPage({ settings, updateSetting, onClearData, onBackup, entries, profile, updateProfile }) {
  const lang = settings.language || 'en'
  const [showSaved, setShowSaved] = useState(false)
  const [profileExpanded, setProfileExpanded] = useState(false)
  const [pinMode, setPinMode] = useState(null) // 'setup', 'change', 'verify-remove', 'verify-change'
  const [hasPin, setHasPin] = useState(() => !!localStorage.getItem('guruji_pin'))
  const [toast, setToast] = useState('')

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }

  const handleProfileChange = (field, value) => {
    updateProfile(field, value)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const handleExportAll = () => {
    downloadCSV(entries, 'guruji-income-all.csv')
  }

  const handleBackup = () => {
    const data = {
      entries: JSON.parse(localStorage.getItem('guruji_income_entries') || '[]'),
      settings: JSON.parse(localStorage.getItem('guruji_settings') || '{}'),
      profile: JSON.parse(localStorage.getItem('guruji_profile') || '{}'),
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guruji-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRestore = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.entries) {
          localStorage.setItem('guruji_income_entries', JSON.stringify(data.entries))
        }
        if (data.settings) {
          localStorage.setItem('guruji_settings', JSON.stringify(data.settings))
        }
        if (data.profile) {
          localStorage.setItem('guruji_profile', JSON.stringify(data.profile))
        }
        alert(t('backupRestored', lang))
        window.location.reload()
      } catch {
        alert(t('invalidBackup', lang))
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (confirm(t('confirmDelete', lang))) {
      onClearData()
    }
  }

  // PIN handlers
  const handleEnablePin = () => {
    setPinMode('setup')
  }

  const handleChangePin = () => {
    setPinMode('verify-change')
  }

  const handleRemovePin = () => {
    setPinMode('verify-remove')
  }

  const handlePinSuccess = (newPin) => {
    if (pinMode === 'setup') {
      localStorage.setItem('guruji_pin', newPin)
      setHasPin(true)
      showToast(t('pinEnabled', lang))
    } else if (pinMode === 'verify-change') {
      setPinMode('setup')
      return // Don't close modal yet
    } else if (pinMode === 'change-new') {
      localStorage.setItem('guruji_pin', newPin)
      showToast(t('pinChanged', lang))
    } else if (pinMode === 'verify-remove') {
      localStorage.removeItem('guruji_pin')
      setHasPin(false)
      showToast(t('pinRemoved', lang))
    }
    setPinMode(null)
  }

  const handlePinCancel = () => {
    setPinMode(null)
  }

  return (
    <>
      <header className="header">
        <div className="header-left"></div>
        <h1 className="header-title">{t('settings', lang)}</h1>
        <div className="header-right"></div>
      </header>

      {/* Toast notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* PIN Lock Modal */}
      {pinMode && (
        <PinLock
          mode={pinMode === 'setup' ? 'setup' : 'verify'}
          onSuccess={handlePinSuccess}
          onCancel={handlePinCancel}
          language={lang}
        />
      )}

      {/* Profile Section */}
      <section className={`settings-section profile-section-card ${profileExpanded ? 'expanded' : ''}`}>
        <div className="profile-header clickable" onClick={() => setProfileExpanded(!profileExpanded)}>
          <div className="profile-avatar">
            <UserIcon className="profile-avatar-icon" />
          </div>
          <div className="profile-header-info">
            <h3 className="profile-name">{profile.name || t('yourName', lang)}</h3>
            <p className="profile-business">{profile.businessName || t('businessOrTemple', lang)}</p>
          </div>
          {showSaved && <span className="profile-saved">{t('profileSaved', lang)}</span>}
          <ChevronRightIcon className={`profile-expand-icon ${profileExpanded ? 'expanded' : ''}`} />
        </div>
        
        {profileExpanded && (
          <>
            <h3 className="settings-title">{t('personalInfo', lang)}</h3>
            
            <div className="profile-form">
              <div className="profile-field">
                <label className="profile-label">
                  <UserIcon className="profile-field-icon" />
                  {t('fullName', lang)}
                </label>
                <input
                  type="text"
                  className="profile-input"
                  value={profile.name || ''}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  placeholder={t('yourName', lang)}
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">
                  <FileIcon className="profile-field-icon" />
                  {t('businessName', lang)}
                </label>
                <input
                  type="text"
                  className="profile-input"
                  value={profile.businessName || ''}
                  onChange={(e) => handleProfileChange('businessName', e.target.value)}
                  placeholder={t('businessOrTemple', lang)}
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">
                  <EmailIcon className="profile-field-icon" />
                  {t('emailAddress', lang)}
                </label>
                <input
                  type="email"
                  className="profile-input"
                  value={profile.email || ''}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  placeholder={t('yourEmail', lang)}
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">
                  <PhoneIcon className="profile-field-icon" />
                  {t('phoneNumber', lang)}
                </label>
                <input
                  type="tel"
                  className="profile-input"
                  value={profile.phone || ''}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder={t('yourPhone', lang)}
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">
                  <LocationIcon className="profile-field-icon" />
                  {t('address', lang)}
                </label>
                <input
                  type="text"
                  className="profile-input"
                  value={profile.address || ''}
                  onChange={(e) => handleProfileChange('address', e.target.value)}
                  placeholder={t('yourAddress', lang)}
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">
                  <FileIcon className="profile-field-icon" />
                  {t('taxId', lang)}
                </label>
                <input
                  type="text"
                  className="profile-input"
                  value={profile.taxId || ''}
                  onChange={(e) => handleProfileChange('taxId', e.target.value)}
                  placeholder={t('yourTaxId', lang)}
                />
              </div>
            </div>
          </>
        )}
      </section>

      {/* Security Section */}
      <section className="settings-section">
        <h3 className="settings-title">{t('security', lang)}</h3>
        
        <div className="settings-group">
          {!hasPin ? (
            <button className="setting-item clickable" onClick={handleEnablePin}>
              <div className="setting-info">
                <span className="setting-label">{t('pinLock', lang)}</span>
                <span className="setting-desc">{t('pinLockDesc', lang)}</span>
              </div>
              <LockIcon className="setting-icon" />
            </button>
          ) : (
            <>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">{t('pinLock', lang)}</span>
                  <span className="setting-desc pin-enabled">
                    <ShieldIcon className="pin-status-icon" /> Enabled
                  </span>
                </div>
              </div>
              
              <button className="setting-item clickable" onClick={handleChangePin}>
                <div className="setting-info">
                  <span className="setting-label">{t('changePin', lang)}</span>
                  <span className="setting-desc">{t('changePinDesc', lang)}</span>
                </div>
                <ChevronRightIcon className="setting-icon" />
              </button>

              <button className="setting-item clickable danger" onClick={handleRemovePin}>
                <div className="setting-info">
                  <span className="setting-label">{t('removePin', lang)}</span>
                  <span className="setting-desc">{t('removePinDesc', lang)}</span>
                </div>
                <TrashIcon className="setting-icon" />
              </button>
            </>
          )}
        </div>
      </section>

      {/* Appearance Section */}
      <section className="settings-section">
        <h3 className="settings-title">{t('appearance', lang)}</h3>
        
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">{t('theme', lang)}</span>
              <span className="setting-desc">{t('themeDesc', lang)}</span>
            </div>
            <div className="theme-toggle">
              <button 
                className={`theme-btn ${settings.theme !== 'light' ? 'active' : ''}`}
                onClick={() => updateSetting('theme', 'dark')}
              >
                {t('darkMode', lang)}
              </button>
              <button 
                className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => updateSetting('theme', 'light')}
              >
                {t('lightMode', lang)}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3 className="settings-title">{t('preferences', lang)}</h3>
        
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">{t('language', lang)}</span>
              <span className="setting-desc">{t('selectLanguage', lang)}</span>
            </div>
            <select 
              className="setting-select"
              value={settings.language || 'en'} 
              onChange={(e) => updateSetting('language', e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.native}</option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">{t('currency', lang)}</span>
              <span className="setting-desc">{t('displayCurrency', lang)}</span>
            </div>
            <select 
              className="setting-select"
              value={settings.currency} 
              onChange={(e) => updateSetting('currency', e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">{t('hapticFeedback', lang)}</span>
              <span className="setting-desc">{t('vibrateOnActions', lang)}</span>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={settings.hapticFeedback}
                onChange={(e) => updateSetting('hapticFeedback', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3 className="settings-title">{t('data', lang)}</h3>
        
        <div className="settings-group">
          <button className="setting-item clickable cloud-backup" onClick={onBackup}>
            <div className="setting-info">
              <span className="setting-label">{t('cloudBackup', lang)}</span>
              <span className="setting-desc">{t('googleSheetsDesc', lang)}</span>
            </div>
            <CloudIcon className="setting-icon cloud" />
          </button>

          <button className="setting-item clickable" onClick={handleExportAll}>
            <div className="setting-info">
              <span className="setting-label">{t('exportToCSV', lang)}</span>
              <span className="setting-desc">{t('downloadAllEntries', lang)}</span>
            </div>
            <DownloadIcon className="setting-icon" />
          </button>

          <button className="setting-item clickable" onClick={handleBackup}>
            <div className="setting-info">
              <span className="setting-label">{t('backupData', lang)}</span>
              <span className="setting-desc">{t('saveAllData', lang)}</span>
            </div>
            <ChevronRightIcon className="setting-icon" />
          </button>

          <label className="setting-item clickable">
            <div className="setting-info">
              <span className="setting-label">{t('restoreBackup', lang)}</span>
              <span className="setting-desc">{t('importFromBackup', lang)}</span>
            </div>
            <ChevronRightIcon className="setting-icon" />
            <input type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
          </label>

          <button className="setting-item clickable danger" onClick={handleClearData}>
            <div className="setting-info">
              <span className="setting-label">{t('clearAllData', lang)}</span>
              <span className="setting-desc">{t('deleteAllEntries', lang)}</span>
            </div>
            <TrashIcon className="setting-icon" />
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3 className="settings-title">{t('about', lang)}</h3>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">{t('version', lang)}</span>
            </div>
            <span className="setting-value">1.3.0</span>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">{t('totalEntries', lang)}</span>
            </div>
            <span className="setting-value">{entries.length}</span>
          </div>
        </div>
      </section>

      <p className="settings-footer">{t('madeWith', lang)}</p>
    </>
  )
}
