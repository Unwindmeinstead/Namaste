import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocalStorage, useSettings, useProfile } from './hooks/useLocalStorage'
import { HomePage } from './pages/HomePage'
import { ReportsPage } from './pages/ReportsPage'
import { TaxPage } from './pages/TaxPage'
import { SettingsPage } from './pages/SettingsPage'
import { BottomNav } from './components/BottomNav'
import { AddModal } from './components/AddModal'
import { EditModal } from './components/EditModal'
import { EntriesModal } from './components/EntriesModal'
import { ActivityModal } from './components/ActivityModal'
import { ScheduleModal } from './components/ScheduleModal'
import { BackupModal } from './components/BackupModal'
import { BackupVault } from './components/BackupVault'
import { PinLock } from './components/PinLock'
import { toLocalDateString } from './utils/format'
import { saveSnapshot, initVault } from './services/backupVault'

function App() {
  const [entries, setEntries] = useLocalStorage('yagya_entries', [])
  const [scheduledServices, setScheduledServices] = useLocalStorage('yagya_scheduled', [])
  const [activities, setActivities] = useLocalStorage('yagya_activities', [])
  const [settings, updateSetting, setSettings] = useSettings()
  const [profile, updateProfile] = useProfile()
  const [activePage, setActivePage] = useState('home')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEntriesModal, setShowEntriesModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showVaultModal, setShowVaultModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  
  // Track if initial backup has been done
  const initialBackupDone = useRef(false)
  
  // PIN lock state
  const [isLocked, setIsLocked] = useState(() => {
    return !!localStorage.getItem('yagya_pin')
  })
  
  // Initialize backup vault on mount
  useEffect(() => {
    initVault().catch(console.error)
  }, [])
  
  // Backup trigger - saves snapshot to IndexedDB vault
  const triggerBackup = useCallback(async (actionType) => {
    try {
      await saveSnapshot({
        entries,
        scheduledServices,
        settings,
        profile
      }, actionType)
    } catch (err) {
      console.error('Backup failed:', err)
    }
  }, [entries, scheduledServices, settings, profile])
  
  // Initial backup when app loads (only once)
  useEffect(() => {
    if (!initialBackupDone.current && entries.length > 0) {
      initialBackupDone.current = true
      triggerBackup('initial')
    }
  }, [entries, triggerBackup])

  // Log activity helper
  const logActivity = (type, details = '') => {
    const activity = {
      id: Date.now().toString(),
      type,
      details,
      timestamp: new Date().toISOString()
    }
    // Keep only last 100 activities
    setActivities(prev => [activity, ...prev].slice(0, 100))
  }

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark')
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', settings.theme === 'light' ? '#ffffff' : '#0a0a0a')
    }
  }, [settings.theme])

  const addEntry = (entry) => {
    const newEntries = [entry, ...entries]
    setEntries(newEntries)
    logActivity('add_entry', entry.type === 'expense' ? `Expense: ${entry.source}` : `Income: ${entry.source}`)
    haptic()
    // Trigger backup after state update
    setTimeout(() => triggerBackup('add_entry'), 100)
  }

  const updateEntry = (updatedEntry) => {
    setEntries(entries.map(e => e.id === updatedEntry.id ? updatedEntry : e))
    logActivity('edit_entry', updatedEntry.source)
    setEditingEntry(null)
    haptic()
    setTimeout(() => triggerBackup('edit_entry'), 100)
  }

  const deleteEntry = (id) => {
    const entry = entries.find(e => e.id === id)
    setEntries(entries.filter(e => e.id !== id).map(e => 
      e.relatedTo === id ? { ...e, relatedTo: null } : e
    ))
    logActivity('delete_entry', entry?.source || '')
    haptic()
    setTimeout(() => triggerBackup('delete_entry'), 100)
  }

  const addScheduledService = (service) => {
    setScheduledServices([...scheduledServices, service])
    logActivity('add_schedule', service.title)
    haptic()
    setTimeout(() => triggerBackup('add_schedule'), 100)
  }

  const updateScheduledService = (updatedService) => {
    setScheduledServices(scheduledServices.map(s => s.id === updatedService.id ? updatedService : s))
    logActivity('edit_schedule', updatedService.title)
    haptic()
    setTimeout(() => triggerBackup('edit_schedule'), 100)
  }

  const deleteScheduledService = (id) => {
    const service = scheduledServices.find(s => s.id === id)
    setScheduledServices(scheduledServices.filter(s => s.id !== id))
    logActivity('delete_schedule', service?.title || '')
    haptic()
    setTimeout(() => triggerBackup('delete_schedule'), 100)
  }
  
  // Restore from vault snapshot
  const handleRestoreFromVault = (data) => {
    if (data.entries) setEntries(data.entries)
    if (data.scheduledServices) setScheduledServices(data.scheduledServices)
    if (data.settings) setSettings(data.settings)
    if (data.profile) {
      Object.entries(data.profile).forEach(([key, value]) => {
        updateProfile(key, value)
      })
    }
    logActivity('restore', 'Restored from backup vault')
    setTimeout(() => triggerBackup('restore'), 100)
  }

  const handleUpdateSetting = (key, value) => {
    updateSetting(key, value)
    logActivity('settings_change', `${key}: ${value}`)
  }

  const clearAllData = () => {
    setEntries([])
    setScheduledServices([])
    logActivity('clear_data', 'All entries and schedules cleared')
    haptic()
  }

  const haptic = () => {
    if (settings.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const getLinkedExpenses = (incomeId) => {
    return entries.filter(e => e.type === 'expense' && e.relatedTo === incomeId)
  }

  const handleUnlock = () => {
    setIsLocked(false)
    haptic()
  }

  const handleDayClick = (date, dayEntries, dayScheduled) => {
    setSelectedDate(toLocalDateString(date))
    setShowScheduleModal(true)
  }

  const handleAddService = () => {
    setSelectedDate(null)
    setShowScheduleModal(true)
  }

  if (isLocked) {
    return (
      <PinLock 
        mode="unlock" 
        onSuccess={handleUnlock}
        language={settings.language}
      />
    )
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <HomePage
            entries={entries}
            scheduledServices={scheduledServices}
            settings={settings}
            onAddClick={() => setShowAddModal(true)}
            onViewAll={() => setShowEntriesModal(true)}
            onActivityClick={() => setShowActivityModal(true)}
            onEditEntry={setEditingEntry}
            onDeleteEntry={deleteEntry}
            getLinkedExpenses={getLinkedExpenses}
            onProfileClick={() => setActivePage('settings')}
            onDayClick={handleDayClick}
            onAddService={handleAddService}
          />
        )
      case 'reports':
        return <ReportsPage entries={entries} settings={settings} />
      case 'tax':
        return <TaxPage entries={entries} settings={settings} profile={profile} />
      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            updateSetting={handleUpdateSetting}
            onClearData={clearAllData}
            onBackup={() => setShowBackupModal(true)}
            onVault={() => setShowVaultModal(true)}
            entries={entries}
            profile={profile}
            updateProfile={updateProfile}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      {renderPage()}
      <BottomNav activePage={activePage} onPageChange={setActivePage} settings={settings} />

      <AddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addEntry}
        settings={settings}
        entries={entries}
      />

      <EditModal
        isOpen={!!editingEntry}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={updateEntry}
        onDelete={deleteEntry}
        settings={settings}
        entries={entries}
      />

      <EntriesModal
        isOpen={showEntriesModal}
        onClose={() => setShowEntriesModal(false)}
        entries={entries}
        settings={settings}
        onEditEntry={(entry) => {
          setShowEntriesModal(false)
          setEditingEntry(entry)
        }}
        onDeleteEntry={deleteEntry}
        getLinkedExpenses={getLinkedExpenses}
      />

      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        activities={activities}
        settings={settings}
      />

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => { setShowScheduleModal(false); setSelectedDate(null); }}
        onAdd={addScheduledService}
        onUpdate={updateScheduledService}
        onDelete={deleteScheduledService}
        settings={settings}
        selectedDate={selectedDate}
        scheduledServices={scheduledServices}
        entries={entries}
      />

      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        entries={entries}
        scheduledServices={scheduledServices}
        settings={settings}
        profile={profile}
      />

      <BackupVault
        isOpen={showVaultModal}
        onClose={() => setShowVaultModal(false)}
        onRestore={handleRestoreFromVault}
        settings={settings}
      />
    </div>
  )
}

export default App
