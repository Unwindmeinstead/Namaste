export const INCOME_CATEGORIES = [
  { id: 'teaching', name: 'Teaching', nameHi: 'शिक्षण', nameNe: 'शिक्षण', icon: '📚', color: '#3b82f6' },
  { id: 'satsang', name: 'Satsang', nameHi: 'सत्संग', nameNe: 'सत्संग', icon: '🙏', color: '#8b5cf6' },
  { id: 'donation', name: 'Donation', nameHi: 'दान', nameNe: 'दान', icon: '💝', color: '#ec4899' },
  { id: 'consultation', name: 'Consultation', nameHi: 'परामर्श', nameNe: 'परामर्श', icon: '💬', color: '#14b8a6' },
  { id: 'workshop', name: 'Workshop', nameHi: 'कार्यशाला', nameNe: 'कार्यशाला', icon: '🎯', color: '#f59e0b' },
  { id: 'retreat', name: 'Retreat', nameHi: 'रिट्रीट', nameNe: 'रिट्रिट', icon: '🏔️', color: '#10b981' },
  { id: 'books', name: 'Books/Media', nameHi: 'पुस्तकें/मीडिया', nameNe: 'पुस्तक/मिडिया', icon: '📖', color: '#6366f1' },
  { id: 'other', name: 'Other', nameHi: 'अन्य', nameNe: 'अन्य', icon: '💰', color: '#64748b' }
]

export const EXPENSE_CATEGORIES = [
  { id: 'travel', name: 'Travel', nameHi: 'यात्रा', nameNe: 'यात्रा', icon: '✈️', color: '#0ea5e9' },
  { id: 'supplies', name: 'Supplies', nameHi: 'सामग्री', nameNe: 'सामग्री', icon: '📦', color: '#f97316' },
  { id: 'rent', name: 'Rent/Venue', nameHi: 'किराया/स्थान', nameNe: 'भाडा/स्थान', icon: '🏠', color: '#84cc16' },
  { id: 'utilities', name: 'Utilities', nameHi: 'उपयोगिताएँ', nameNe: 'उपयोगिता', icon: '💡', color: '#eab308' },
  { id: 'food', name: 'Food', nameHi: 'भोजन', nameNe: 'खाना', icon: '🍽️', color: '#ef4444' },
  { id: 'marketing', name: 'Marketing', nameHi: 'विपणन', nameNe: 'मार्केटिङ', icon: '📢', color: '#a855f7' },
  { id: 'equipment', name: 'Equipment', nameHi: 'उपकरण', nameNe: 'उपकरण', icon: '🎤', color: '#06b6d4' },
  { id: 'other_expense', name: 'Other', nameHi: 'अन्य', nameNe: 'अन्य', icon: '💸', color: '#64748b' }
]

export const CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1]
}

export function getCategoryColor(id) {
  return getCategoryById(id).color
}

export function getCategoryName(id, language = 'en') {
  const cat = getCategoryById(id)
  if (language === 'hi') return cat.nameHi
  if (language === 'ne') return cat.nameNe
  return cat.name
}
