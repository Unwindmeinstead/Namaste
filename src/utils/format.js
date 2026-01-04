export function formatCurrency(amount, currency = 'USD') {
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  const symbol = symbols[currency] || '$'
  return symbol + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function formatDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayStr = today.toISOString().split('T')[0]
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (dateStr === todayStr) return 'Today'
  if (dateStr === yesterdayStr) return 'Yesterday'

  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

export function formatFullDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function getMonthName(monthIndex) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[monthIndex]
}

export function getMonthFullName(monthIndex) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return months[monthIndex]
}

export function getCurrentFiscalYear() {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  // Fiscal year starts April 1st
  if (month >= 3) {
    return `FY ${year}-${(year + 1).toString().slice(-2)}`
  }
  return `FY ${year - 1}-${year.toString().slice(-2)}`
}

export function getQuarter(date) {
  const month = new Date(date).getMonth()
  if (month >= 0 && month <= 2) return 'Q1'
  if (month >= 3 && month <= 5) return 'Q2'
  if (month >= 6 && month <= 8) return 'Q3'
  return 'Q4'
}

export function downloadCSV(entries, filename = 'income-report.csv') {
  const headers = ['Date', 'Source', 'Amount', 'Notes', 'Category']
  const rows = entries.map(e => [
    e.date,
    e.source || 'Income',
    e.amount,
    e.notes || '',
    e.category || 'Other'
  ])
  
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function groupEntriesByMonth(entries) {
  const grouped = {}
  entries.forEach(entry => {
    const date = new Date(entry.date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(entry)
  })
  return grouped
}

export function groupEntriesBySource(entries) {
  const grouped = {}
  entries.forEach(entry => {
    const source = entry.source || 'Other'
    if (!grouped[source]) grouped[source] = { total: 0, count: 0 }
    grouped[source].total += entry.amount
    grouped[source].count++
  })
  return grouped
}

export function groupEntriesByCategory(entries) {
  const grouped = {}
  entries.forEach(entry => {
    const category = entry.category || 'Other'
    if (!grouped[category]) grouped[category] = { total: 0, count: 0 }
    grouped[category].total += entry.amount
    grouped[category].count++
  })
  return grouped
}

export function getEntriesForPeriod(entries, startDate, endDate) {
  return entries.filter(e => {
    const date = new Date(e.date)
    return date >= startDate && date <= endDate
  })
}

export function getThisMonthEntries(entries) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return getEntriesForPeriod(entries, start, end)
}

export function getLastMonthEntries(entries) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 0)
  return getEntriesForPeriod(entries, start, end)
}

export function getThisYearEntries(entries) {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const end = new Date(now.getFullYear(), 11, 31)
  return getEntriesForPeriod(entries, start, end)
}

export function calculateQuarterlyTotals(entries) {
  const quarters = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
  entries.forEach(entry => {
    const q = getQuarter(entry.date)
    quarters[q] += entry.amount
  })
  return quarters
}
