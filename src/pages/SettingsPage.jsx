import { ChevronRightIcon, TrashIcon, DownloadIcon } from '../components/Icons'
import { downloadCSV } from '../utils/format'
import { t } from '../utils/translations'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
]

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' }
]

export function SettingsPage({ settings, updateSetting, onClearData, entries }) {
  const lang = settings.language || 'en'

  const handleExportAll = () => {
    downloadCSV(entries, 'guruji-income-all.csv')
  }

  const handleBackup = () => {
    const data = {
      entries: JSON.parse(localStorage.getItem('guruji_income_entries') || '[]'),
      settings: JSON.parse(localStorage.getItem('guruji_settings') || '{}'),
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

  return (
    <>
      <header className="header">
        <div className="header-left"></div>
        <h1 className="header-title">{t('settings', lang)}</h1>
        <div className="header-right"></div>
      </header>

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
            <span className="setting-value">1.1.0</span>
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
