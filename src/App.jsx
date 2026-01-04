import { useState } from 'react'
import { useLocalStorage, useSettings } from './hooks/useLocalStorage'
import { HomePage } from './pages/HomePage'
import { ReportsPage } from './pages/ReportsPage'
import { TaxPage } from './pages/TaxPage'
import { SettingsPage } from './pages/SettingsPage'
import { BottomNav } from './components/BottomNav'
import { AddModal } from './components/AddModal'
import { EditModal } from './components/EditModal'
import { EntriesModal } from './components/EntriesModal'

function App() {
  const [entries, setEntries] = useLocalStorage('guruji_income_entries', [])
  const [settings, updateSetting] = useSettings()
  const [activePage, setActivePage] = useState('home')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEntriesModal, setShowEntriesModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

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
    setEntries(entries.filter(e => e.id !== id))
    haptic()
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to delete ALL income entries? This cannot be undone.')) {
      setEntries([])
      haptic()
    }
  }

  const haptic = () => {
    if (settings.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <HomePage
            entries={entries}
            settings={settings}
            onAddClick={() => setShowAddModal(true)}
            onViewAll={() => setShowEntriesModal(true)}
            onEditEntry={setEditingEntry}
            onDeleteEntry={deleteEntry}
          />
        )
      case 'reports':
        return <ReportsPage entries={entries} settings={settings} />
      case 'tax':
        return <TaxPage entries={entries} settings={settings} />
      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            updateSetting={updateSetting}
            onClearData={clearAllData}
            entries={entries}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      {renderPage()}
      <BottomNav activePage={activePage} onPageChange={setActivePage} />

      <AddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addEntry}
        settings={settings}
      />

      <EditModal
        isOpen={!!editingEntry}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={updateEntry}
        onDelete={deleteEntry}
        settings={settings}
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
      />
    </div>
  )
}

export default App
