import { ChevronRightIcon, TrashIcon, DownloadIcon } from '../components/Icons'
import { downloadCSV } from '../utils/format'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
]

export function SettingsPage({ settings, updateSetting, onClearData, entries }) {
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
        alert('Backup restored! Refreshing...')
        window.location.reload()
      } catch {
        alert('Invalid backup file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <header className="header">
        <div className="header-left"></div>
        <h1 className="header-title">Settings</h1>
        <div className="header-right"></div>
      </header>

      <section className="settings-section">
        <h3 className="settings-title">Preferences</h3>
        
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Currency</span>
              <span className="setting-desc">Display currency for amounts</span>
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
              <span className="setting-label">Haptic Feedback</span>
              <span className="setting-desc">Vibrate on actions</span>
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
        <h3 className="settings-title">Data</h3>
        
        <div className="settings-group">
          <button className="setting-item clickable" onClick={handleExportAll}>
            <div className="setting-info">
              <span className="setting-label">Export to CSV</span>
              <span className="setting-desc">Download all entries as spreadsheet</span>
            </div>
            <DownloadIcon className="setting-icon" />
          </button>

          <button className="setting-item clickable" onClick={handleBackup}>
            <div className="setting-info">
              <span className="setting-label">Backup Data</span>
              <span className="setting-desc">Save all data to a file</span>
            </div>
            <ChevronRightIcon className="setting-icon" />
          </button>

          <label className="setting-item clickable">
            <div className="setting-info">
              <span className="setting-label">Restore Backup</span>
              <span className="setting-desc">Import data from backup file</span>
            </div>
            <ChevronRightIcon className="setting-icon" />
            <input type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
          </label>

          <button className="setting-item clickable danger" onClick={onClearData}>
            <div className="setting-info">
              <span className="setting-label">Clear All Data</span>
              <span className="setting-desc">Delete all income entries</span>
            </div>
            <TrashIcon className="setting-icon" />
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3 className="settings-title">About</h3>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Version</span>
            </div>
            <span className="setting-value">1.0.0</span>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Total Entries</span>
            </div>
            <span className="setting-value">{entries.length}</span>
          </div>
        </div>
      </section>

      <p className="settings-footer">Guruji Income Tracker • Made with 🙏</p>
    </>
  )
}

