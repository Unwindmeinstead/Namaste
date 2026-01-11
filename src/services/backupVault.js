/**
 * Backup Vault Service
 * Uses IndexedDB for persistent backup storage that survives localStorage clears
 * Automatically saves snapshots on every data change
 */

const DB_NAME = 'yagya_backup_vault'
const DB_VERSION = 1
const STORE_NAME = 'snapshots'
const MAX_SNAPSHOTS = 100

let db = null

// Initialize IndexedDB
export async function initVault() {
  if (db) return db
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

// Save a snapshot to the vault
export async function saveSnapshot(data, actionType = 'unknown') {
  await initVault()
  
  const snapshot = {
    id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    actionType, // 'add_entry', 'edit_entry', 'delete_entry', 'add_schedule', etc.
    entryCount: data.entries?.length || 0,
    scheduleCount: data.scheduledServices?.length || 0,
    data: {
      entries: data.entries || [],
      scheduledServices: data.scheduledServices || [],
      settings: data.settings || {},
      profile: data.profile || {}
    }
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.add(snapshot)
    
    request.onsuccess = async () => {
      // Prune old snapshots if over limit
      await pruneOldSnapshots()
      resolve(snapshot)
    }
    
    request.onerror = () => reject(request.error)
  })
}

// Get all snapshots (newest first)
export async function getAllSnapshots() {
  await initVault()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()
    
    request.onsuccess = () => {
      const snapshots = request.result || []
      // Sort by timestamp descending (newest first)
      snapshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      resolve(snapshots)
    }
    
    request.onerror = () => reject(request.error)
  })
}

// Get a single snapshot by ID
export async function getSnapshot(id) {
  await initVault()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Get snapshot count
export async function getSnapshotCount() {
  await initVault()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.count()
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Get the most recent snapshot
export async function getLatestSnapshot() {
  const snapshots = await getAllSnapshots()
  return snapshots[0] || null
}

// Prune old snapshots to keep under MAX_SNAPSHOTS
async function pruneOldSnapshots() {
  const snapshots = await getAllSnapshots()
  
  if (snapshots.length <= MAX_SNAPSHOTS) return
  
  // Get IDs of snapshots to delete (oldest ones beyond limit)
  const toDelete = snapshots.slice(MAX_SNAPSHOTS).map(s => s.id)
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    let deleted = 0
    toDelete.forEach(id => {
      const request = store.delete(id)
      request.onsuccess = () => {
        deleted++
        if (deleted === toDelete.length) resolve()
      }
      request.onerror = () => reject(request.error)
    })
    
    if (toDelete.length === 0) resolve()
  })
}

// Delete all snapshots (clear vault)
export async function clearVault() {
  await initVault()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Export entire vault as JSON
export async function exportVault() {
  const snapshots = await getAllSnapshots()
  
  return {
    exportedAt: new Date().toISOString(),
    snapshotCount: snapshots.length,
    snapshots
  }
}

// Download a single snapshot as JSON file
export function downloadSnapshot(snapshot) {
  const data = {
    ...snapshot.data,
    exportedAt: new Date().toISOString(),
    snapshotTimestamp: snapshot.timestamp,
    snapshotId: snapshot.id
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `yagya-backup-${snapshot.timestamp.split('T')[0]}-${snapshot.id.slice(-6)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Download entire vault as JSON file
export async function downloadEntireVault() {
  const vaultData = await exportVault()
  
  const blob = new Blob([JSON.stringify(vaultData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `yagya-vault-complete-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Format action type for display
export function formatActionType(actionType) {
  const labels = {
    'add_entry': 'Added entry',
    'edit_entry': 'Edited entry',
    'delete_entry': 'Deleted entry',
    'add_schedule': 'Added service',
    'edit_schedule': 'Edited service',
    'delete_schedule': 'Deleted service',
    'restore': 'Restored backup',
    'import': 'Imported data',
    'initial': 'Initial backup',
    'manual': 'Manual backup'
  }
  return labels[actionType] || actionType
}

// Format timestamp for display
export function formatSnapshotTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
