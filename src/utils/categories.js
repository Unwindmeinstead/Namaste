export const CATEGORIES = [
  { id: 'teaching', name: 'Teaching', icon: '📚', color: '#3b82f6' },
  { id: 'satsang', name: 'Satsang', icon: '🙏', color: '#8b5cf6' },
  { id: 'donation', name: 'Donation', icon: '💝', color: '#ec4899' },
  { id: 'consultation', name: 'Consultation', icon: '💬', color: '#14b8a6' },
  { id: 'workshop', name: 'Workshop', icon: '🎯', color: '#f59e0b' },
  { id: 'retreat', name: 'Retreat', icon: '🏔️', color: '#10b981' },
  { id: 'books', name: 'Books/Media', icon: '📖', color: '#6366f1' },
  { id: 'other', name: 'Other', icon: '💰', color: '#64748b' }
]

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}

export function getCategoryColor(id) {
  return getCategoryById(id).color
}

