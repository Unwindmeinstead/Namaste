import { useState, useEffect } from 'react'
import { useLocalStorage, useSettings, useProfile } from './hooks/useLocalStorage'
import { HomePage } from './pages/HomePage'
import { ReportsPage } from './pages/ReportsPage'
import { TaxPage } from './pages/TaxPage'
import { SettingsPage } from './pages/SettingsPage'
import { BottomNav } from './components/BottomNav'
import { AddModal } from './components/AddModal'
import { EditModal } from './components/EditModal'
import { EntriesModal } from './components/EntriesModal'
import { ScheduleModal } from './components/ScheduleModal'
import { PinLock } from './components/PinLock'

function App() {
  const [entries, setEntries] = useLocalStorage('guruji_income_entries', [])
  const [scheduledServices, setScheduledServices] = useLocalStorage('guruji_scheduled_services', [])
  const [settings, updateSetting] = useSettings()
  const [profile, updateProfile] = useProfile()
  const [activePage, setActivePage] = useState('home')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEntriesModal, setShowEntriesModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  
  // PIN lock state
  const [isLocked, setIsLocked] = useState(() => {
    return !!localStorage.getItem('guruji_pin')
  })

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark')
    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', settings.theme === 'light' ? '#ffffff' : '#0a0a0a')
    }
  }, [settings.theme])

  const addEntry = (entry) => {
    setEntries([entry, ...entries])
    haptic()
  }

  const updateEntry = (updatedEntry) => {
    setEntries(entries.map(e => e.id === updatedEntry.id ? updatedEntry : e))
    setEditingEntry(null)
    haptic()
  }

  const deleteEntry = (id) => {
    // Also unlink any expenses that were linked to this entry
    setEntries(entries.filter(e => e.id !== id).map(e => 
      e.relatedTo === id ? { ...e, relatedTo: null } : e
    ))
    haptic()
  }

  const addScheduledService = (service) => {
    setScheduledServices([...scheduledServices, service])
    haptic()
  }

  const deleteScheduledService = (id) => {
    setScheduledServices(scheduledServices.filter(s => s.id !== id))
    haptic()
  }

  const clearAllData = () => {
    setEntries([])
    setScheduledServices([])
    haptic()
  }

  const haptic = () => {
    if (settings.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  // Get expenses linked to a specific income entry
  const getLinkedExpenses = (incomeId) => {
    return entries.filter(e => e.type === 'expense' && e.relatedTo === incomeId)
  }

  const handleUnlock = () => {
    setIsLocked(false)
    haptic()
  }

  const handleDayClick = (date, dayEntries, dayScheduled) => {
    setSelectedDate(date.toISOString().split('T')[0])
    setShowScheduleModal(true)
  }

  const handleAddService = () => {
    setSelectedDate(null)
    setShowScheduleModal(true)
  }

  // Show PIN lock screen if locked
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
            updateSetting={updateSetting}
            onClearData={clearAllData}
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

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => { setShowScheduleModal(false); setSelectedDate(null); }}
        onAdd={addScheduledService}
        onDelete={deleteScheduledService}
        settings={settings}
        selectedDate={selectedDate}
        scheduledServices={scheduledServices}
        entries={entries}
      />
    </div>
  )
}

export default App
