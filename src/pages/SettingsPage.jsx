import { useState, useEffect } from 'react'
import { ChevronRightIcon, TrashIcon, DownloadIcon, UserIcon, EmailIcon, PhoneIcon, LocationIcon, FileIcon, LockIcon, ShieldIcon } from '../components/Icons'
import { downloadCSV } from '../utils/format'
import { t } from '../utils/translations'
import { PinLock } from '../components/PinLock'
import { HelpGuide } from '../components/HelpGuide'
import { getSnapshotCount, getLatestSnapshot } from '../services/backupVault'

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

// Vault icon
const VaultIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

// Get first name with capitalized first letter
function getFirstName(fullName) {
  if (!fullName) return ''
  const firstName = fullName.trim().split(' ')[0]
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
}

export function SettingsPage({ settings, updateSetting, onClearData, onBackup, onVault, entries, profile, updateProfile }) {
  const lang = settings.language || 'en'
  const [showSaved, setShowSaved] = useState(false)
  const [profileExpanded, setProfileExpanded] = useState(false)
  const [securityExpanded, setSecurityExpanded] = useState(false)
  const [preferencesExpanded, setPreferencesExpanded] = useState(false)
  const [dataExpanded, setDataExpanded] = useState(false)
  const [showHelpGuide, setShowHelpGuide] = useState(false)
  const [pinMode, setPinMode] = useState(null) // 'setup', 'change', 'verify-remove', 'verify-change'
  const [hasPin, setHasPin] = useState(() => !!localStorage.getItem('yagya_pin'))
  const [toast, setToast] = useState('')
  const [vaultCount, setVaultCount] = useState(0)
  const [lastBackup, setLastBackup] = useState(null)
  
  // Load vault info
  useEffect(() => {
    const loadVaultInfo = async () => {
      try {
        const count = await getSnapshotCount()
        const latest = await getLatestSnapshot()
        setVaultCount(count)
        setLastBackup(latest?.timestamp || null)
      } catch (err) {
        console.error('Failed to load vault info:', err)
      }
    }
    loadVaultInfo()
  }, [])

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
    downloadCSV(entries, 'yagya-income-all.csv')
  }

  const handleBackup = () => {
    const data = {
      entries: JSON.parse(localStorage.getItem('yagya_entries') || '[]'),
      settings: JSON.parse(localStorage.getItem('yagya_settings') || '{}'),
      profile: JSON.parse(localStorage.getItem('yagya_profile') || '{}'),
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yagya-backup-${new Date().toISOString().split('T')[0]}.json`
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
          localStorage.setItem('yagya_entries', JSON.stringify(data.entries))
        }
        if (data.settings) {
          localStorage.setItem('yagya_settings', JSON.stringify(data.settings))
        }
        if (data.profile) {
          localStorage.setItem('yagya_profile', JSON.stringify(data.profile))
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
      localStorage.setItem('yagya_pin', newPin)
      setHasPin(true)
      showToast(t('pinEnabled', lang))
    } else if (pinMode === 'verify-change') {
      setPinMode('setup')
      return // Don't close modal yet
    } else if (pinMode === 'change-new') {
      localStorage.setItem('yagya_pin', newPin)
      showToast(t('pinChanged', lang))
    } else if (pinMode === 'verify-remove') {
      localStorage.removeItem('yagya_pin')
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
            {profile.name ? (
              <span className="profile-avatar-letter">{profile.name.charAt(0).toUpperCase()}</span>
            ) : (
              <UserIcon className="profile-avatar-icon" />
            )}
          </div>
          <div className="profile-header-info">
            <h3 className="profile-name">
              {profile.name ? `Hello, ${getFirstName(profile.name)}!` : t('yourName', lang)}
            </h3>
            <p className="profile-business">{profile.businessName || t('businessOrTemple', lang)}</p>
          </div>
          {showSaved && <span className="profile-saved">{t('profileSaved', lang)}</span>}
          <ChevronRightIcon className={`profile-expand-icon ${profileExpanded ? 'expanded' : ''}`} />
        </div>
        
        {profileExpanded && (
          <>
            {/* Login Placeholder */}
            <div className="login-placeholder">
              <div className="login-placeholder-icon">
                <LockIcon />
              </div>
              <div className="login-placeholder-content">
                <h4 className="login-placeholder-title">{t('signIn', lang) || 'Sign In'}</h4>
                <p className="login-placeholder-desc">{t('signInDesc', lang) || 'Sync your data across devices'}</p>
              </div>
              <button className="login-placeholder-btn" disabled>
                {t('comingSoon', lang) || 'Coming Soon'}
              </button>
            </div>

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
      <section className="settings-section collapsible-section">
        <button 
          className={`section-header-toggle ${securityExpanded ? 'expanded' : ''}`}
          onClick={() => setSecurityExpanded(!securityExpanded)}
        >
          <div className="section-header-info">
            <LockIcon className="section-header-icon" />
            <div>
              <h3 className="settings-title">{t('security', lang)}</h3>
              <span className="section-header-desc">{hasPin ? t('pinEnabled', lang) : t('pinLockDesc', lang)}</span>
            </div>
          </div>
          <ChevronRightIcon className={`section-toggle-icon ${securityExpanded ? 'expanded' : ''}`} />
        </button>
        
        <div className={`section-collapse ${securityExpanded ? 'expanded' : ''}`}>
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

      {/* Preferences Section */}
      <section className="settings-section collapsible-section">
        <button 
          className={`section-header-toggle ${preferencesExpanded ? 'expanded' : ''}`}
          onClick={() => setPreferencesExpanded(!preferencesExpanded)}
        >
          <div className="section-header-info">
            <svg className="section-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            <div>
              <h3 className="settings-title">{t('preferences', lang)}</h3>
              <span className="section-header-desc">{t('languageCurrencySettings', lang)}</span>
            </div>
          </div>
          <ChevronRightIcon className={`section-toggle-icon ${preferencesExpanded ? 'expanded' : ''}`} />
        </button>
        
        <div className={`section-collapse ${preferencesExpanded ? 'expanded' : ''}`}>
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
        </div>
      </section>

      {/* Data Section */}
      <section className="settings-section collapsible-section">
        <button 
          className={`section-header-toggle ${dataExpanded ? 'expanded' : ''}`}
          onClick={() => setDataExpanded(!dataExpanded)}
        >
          <div className="section-header-info">
            <DownloadIcon className="section-header-icon" />
            <div>
              <h3 className="settings-title">{t('data', lang)}</h3>
              <span className="section-header-desc">{t('backupExportSettings', lang)}</span>
            </div>
          </div>
          <ChevronRightIcon className={`section-toggle-icon ${dataExpanded ? 'expanded' : ''}`} />
        </button>
        
        <div className={`section-collapse ${dataExpanded ? 'expanded' : ''}`}>
          {/* Backup Vault - Prominent button */}
          <button className="settings-vault-btn" onClick={onVault}>
            <div className="settings-vault-icon">
              <VaultIcon />
            </div>
            <div className="settings-vault-info">
              <span className="settings-vault-title">Backup Vault</span>
              <span className="settings-vault-meta">
                {vaultCount > 0 
                  ? `${vaultCount} snapshots saved` 
                  : 'Auto-saves every change'}
              </span>
            </div>
            <ChevronRightIcon className="settings-vault-arrow" />
          </button>
          
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
        </div>
      </section>

      <section className="settings-section">
        <h3 className="settings-title">{t('about', lang)}</h3>
        <div className="settings-group">
          <button className="setting-item clickable" onClick={() => setShowHelpGuide(true)}>
            <div className="setting-info">
              <span className="setting-label">{t('helpGuide', lang)}</span>
              <span className="setting-desc">{t('helpGuideDesc', lang)}</span>
            </div>
            <ChevronRightIcon className="setting-icon" />
          </button>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">{t('version', lang)}</span>
            </div>
            <span className="setting-value">1.0.0</span>
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

      {/* Help Guide Modal */}
      <HelpGuide
        isOpen={showHelpGuide}
        onClose={() => setShowHelpGuide(false)}
        settings={settings}
      />
    </>
  )
}
