export const INCOME_CATEGORIES = [
  { id: 'saptahah', name: 'Saptahah', nameHi: 'सप्ताह', nameNe: 'सप्ताह', icon: '📜', color: '#3b82f6' },
  { id: 'bartabandha', name: 'Bartabandha', nameHi: 'व्रतबन्ध', nameNe: 'व्रतबन्ध', icon: '🕉️', color: '#8b5cf6' },
  { id: 'vivah', name: 'Vivah', nameHi: 'विवाह', nameNe: 'विवाह', icon: '💒', color: '#ec4899' },
  { id: 'bhagawat', name: 'Bhagawat', nameHi: 'भागवत', nameNe: 'भागवत', icon: '📖', color: '#14b8a6' },
  { id: 'japsanthi', name: 'Jap-Santhi', nameHi: 'जप-शान्ति', nameNe: 'जप-शान्ति', icon: '🙏', color: '#f59e0b' },
  { id: 'ghatana', name: 'Ghatana', nameHi: 'घटना', nameNe: 'घटना', icon: '🎯', color: '#10b981' },
  { id: 'namakaran', name: 'Namakaran', nameHi: 'नामकरण', nameNe: 'नामकरण', icon: '👶', color: '#6366f1' },
  { id: 'saradha', name: 'Saradha', nameHi: 'श्राद्ध', nameNe: 'श्राद्ध', icon: '🪔', color: '#64748b' }
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
