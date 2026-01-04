import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Header } from './components/Header'
import { SummaryCard } from './components/SummaryCard'
import { AddButton } from './components/AddButton'
import { EntriesList } from './components/EntriesList'
import { BottomNav } from './components/BottomNav'
import { AddModal } from './components/AddModal'
import { EntriesModal } from './components/EntriesModal'

function App() {
  const [entries, setEntries] = useLocalStorage('guruji_income_entries', [])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEntriesModal, setShowEntriesModal] = useState(false)

  const total = entries.reduce((sum, e) => sum + e.amount, 0)

  const addEntry = (entry) => {
    setEntries([entry, ...entries])
  }

  return (
    <div className="app">
      <Header onMenuClick={() => setShowEntriesModal(true)} />
      <SummaryCard total={total} />
      <AddButton onClick={() => setShowAddModal(true)} />
      <EntriesList entries={entries} onViewAll={() => setShowEntriesModal(true)} />
      <BottomNav />

      <AddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addEntry}
      />

      <EntriesModal
        isOpen={showEntriesModal}
        onClose={() => setShowEntriesModal(false)}
        entries={entries}
      />
    </div>
  )
}

export default App
