import { formatCurrency, getMonthFullName, getQuarter } from './format'
import { getCategoryById } from './categories'

// Clean SVG icons for professional reports (inline, no emojis)
const REPORT_ICONS = {
  chart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  income: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  expense: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  list: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  calendar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  folder: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  car: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  // Category-specific icons
  saptahah: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  bartabandha: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  vivah: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  bhagawat: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  japsanthi: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  ghatana: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  namakaran: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>`,
  saradha: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v8m0 0l3-3m-3 3l-3-3"/><circle cx="12" cy="17" r="5"/></svg>`,
  travel: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
  supplies: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  rent: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  utilities: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  food: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  marketing: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  equipment: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  other_expense: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
}

function getCategoryIcon(categoryId) {
  return REPORT_ICONS[categoryId] || REPORT_ICONS.other_expense
}

export function generateTaxReport(entries, profile, settings, year) {
  const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === year)
  const incomeEntries = yearEntries.filter(e => e.type !== 'expense').sort((a, b) => new Date(a.date) - new Date(b.date))
  const expenseEntries = yearEntries.filter(e => e.type === 'expense').sort((a, b) => new Date(a.date) - new Date(b.date))
  
  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
  const netIncome = totalIncome - totalExpenses
  const totalMiles = yearEntries.filter(e => e.miles).reduce((sum, e) => sum + (e.miles || 0), 0)
  
  // Group by quarter
  const quarters = { Q1: { income: 0, expenses: 0 }, Q2: { income: 0, expenses: 0 }, Q3: { income: 0, expenses: 0 }, Q4: { income: 0, expenses: 0 } }
  incomeEntries.forEach(e => { quarters[getQuarter(e.date)].income += e.amount })
  expenseEntries.forEach(e => { quarters[getQuarter(e.date)].expenses += e.amount })
  
  // Group by month
  const monthlyData = Array(12).fill(null).map(() => ({ income: 0, expenses: 0 }))
  yearEntries.forEach(e => {
    const month = new Date(e.date).getMonth()
    if (e.type === 'expense') {
      monthlyData[month].expenses += e.amount
    } else {
      monthlyData[month].income += e.amount
    }
  })
  
  // Group income by category
  const incomeByCategory = {}
  incomeEntries.forEach(e => {
    const cat = getCategoryById(e.category)
    if (!incomeByCategory[cat.id]) incomeByCategory[cat.id] = { name: cat.name, total: 0, count: 0, color: cat.color }
    incomeByCategory[cat.id].total += e.amount
    incomeByCategory[cat.id].count++
  })
  
  // Group expenses by category
  const expensesByCategory = {}
  expenseEntries.forEach(e => {
    const cat = getCategoryById(e.category)
    if (!expensesByCategory[cat.id]) expensesByCategory[cat.id] = { name: cat.name, total: 0, count: 0, color: cat.color }
    expensesByCategory[cat.id].total += e.amount
    expensesByCategory[cat.id].count++
  })

  const currency = settings.currency || 'USD'
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  const formatAmt = (amt) => formatCurrency(amt, currency)
  const formatDateStr = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Income Tax Report ${year} - ${profile.name || 'Yagya'}</title>
  <style>
    :root {
      --color-bg: #ffffff;
      --color-bg-subtle: #f8fafc;
      --color-bg-muted: #f1f5f9;
      --color-border: #e2e8f0;
      --color-border-strong: #cbd5e1;
      --color-text: #0f172a;
      --color-text-secondary: #475569;
      --color-text-muted: #64748b;
      --color-accent: #0f172a;
      --color-income: #059669;
      --color-income-bg: #ecfdf5;
      --color-expense: #dc2626;
      --color-expense-bg: #fef2f2;
      --color-net: #1d4ed8;
      --color-net-bg: #eff6ff;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--color-bg-subtle);
      color: var(--color-text);
      line-height: 1.6;
      font-size: 14px;
      padding: 32px;
    }
    
    .report {
      max-width: 900px;
      margin: 0 auto;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      overflow: hidden;
    }
    
    /* Header */
    .header {
      background: var(--color-accent);
      color: white;
      padding: 48px;
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    
    .header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.8;
    }
    
    .header-brand svg {
      width: 24px;
      height: 24px;
    }
    
    .header-year {
      text-align: right;
    }
    
    .header-year-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.6;
      margin-bottom: 4px;
    }
    
    .header-year-value {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    
    .header .subtitle {
      font-size: 16px;
      opacity: 0.8;
    }
    
    /* Profile Section */
    .profile-section {
      background: var(--color-bg-muted);
      padding: 24px 48px;
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      border-bottom: 1px solid var(--color-border);
    }
    
    .profile-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .profile-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-muted);
      font-weight: 500;
    }
    
    .profile-value {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text);
    }
    
    /* Content */
    .content {
      padding: 48px;
    }
    
    /* Summary Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 48px;
    }
    
    .summary-card {
      padding: 24px;
      border-radius: 8px;
      border: 1px solid var(--color-border);
    }
    
    .summary-card.income { background: var(--color-income-bg); border-color: #a7f3d0; }
    .summary-card.expense { background: var(--color-expense-bg); border-color: #fecaca; }
    .summary-card.net { background: var(--color-net-bg); border-color: #93c5fd; }
    
    .summary-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .summary-card.income .summary-label { color: var(--color-income); }
    .summary-card.expense .summary-label { color: var(--color-expense); }
    .summary-card.net .summary-label { color: var(--color-net); }
    
    .summary-amount {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }
    
    .summary-card.income .summary-amount { color: #047857; }
    .summary-card.expense .summary-amount { color: #b91c1c; }
    .summary-card.net .summary-amount { color: #1e40af; }
    
    .summary-meta {
      font-size: 12px;
      color: var(--color-text-muted);
    }
    
    /* Section */
    .section {
      margin-bottom: 40px;
    }
    
    .section:last-child {
      margin-bottom: 0;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--color-accent);
    }
    
    .section-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--color-accent);
      color: white;
      border-radius: 6px;
    }
    
    .section-icon svg {
      width: 18px;
      height: 18px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
    }
    
    .section-desc {
      font-size: 12px;
      color: var(--color-text-muted);
      margin-left: auto;
    }
    
    /* Quarterly Grid */
    .quarterly-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    
    .quarter-card {
      background: var(--color-bg-subtle);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 20px;
    }
    
    .quarter-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 16px;
      text-align: center;
    }
    
    .quarter-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 6px 0;
    }
    
    .quarter-row.income { color: var(--color-income); }
    .quarter-row.expense { color: var(--color-expense); }
    .quarter-row.net {
      font-weight: 600;
      color: var(--color-text);
      border-top: 1px solid var(--color-border);
      margin-top: 8px;
      padding-top: 12px;
    }
    
    /* Monthly Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    
    .data-table th {
      text-align: left;
      padding: 12px 16px;
      background: var(--color-bg-muted);
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-secondary);
      border-bottom: 2px solid var(--color-border);
    }
    
    .data-table th:last-child,
    .data-table td:last-child {
      text-align: right;
    }
    
    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border);
    }
    
    .data-table tbody tr:hover {
      background: var(--color-bg-subtle);
    }
    
    .data-table .income-val { color: var(--color-income); font-weight: 500; }
    .data-table .expense-val { color: var(--color-expense); font-weight: 500; }
    .data-table .net-val { font-weight: 600; color: var(--color-text); }
    
    .data-table tfoot td {
      background: var(--color-bg-muted);
      font-weight: 600;
      border-bottom: none;
    }
    
    /* Category Grid */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .category-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--color-bg-subtle);
      border: 1px solid var(--color-border);
      border-radius: 8px;
    }
    
    .category-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      color: white;
    }
    
    .category-icon svg {
      width: 18px;
      height: 18px;
    }
    
    .category-info {
      flex: 1;
    }
    
    .category-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text);
    }
    
    .category-count {
      font-size: 11px;
      color: var(--color-text-muted);
    }
    
    .category-amount {
      font-size: 15px;
      font-weight: 600;
    }
    
    .category-amount.income { color: var(--color-income); }
    .category-amount.expense { color: var(--color-expense); }
    
    /* Transaction Table */
    .tx-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    
    .tx-table th {
      text-align: left;
      padding: 10px 12px;
      background: var(--color-bg-muted);
      font-weight: 600;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-muted);
      border-bottom: 2px solid var(--color-border);
    }
    
    .tx-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--color-border);
      vertical-align: middle;
    }
    
    .tx-table tbody tr:hover {
      background: var(--color-bg-subtle);
    }
    
    .tx-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      color: white;
    }
    
    .tx-icon svg {
      width: 14px;
      height: 14px;
    }
    
    .tx-date {
      color: var(--color-text-muted);
      font-size: 11px;
    }
    
    .tx-amount {
      font-weight: 600;
      text-align: right;
    }
    
    .tx-amount.income { color: var(--color-income); }
    .tx-amount.expense { color: var(--color-expense); }
    
    .tx-table tfoot td {
      background: var(--color-bg-muted);
      font-weight: 600;
      font-size: 13px;
    }
    
    /* Footer */
    .footer {
      background: var(--color-bg-muted);
      padding: 24px 48px;
      text-align: center;
      border-top: 1px solid var(--color-border);
    }
    
    .footer-generated {
      font-size: 12px;
      color: var(--color-text-muted);
      margin-bottom: 8px;
    }
    
    .footer-disclaimer {
      font-size: 11px;
      color: var(--color-text-muted);
      font-style: italic;
    }
    
    @media print {
      body { padding: 0; background: white; }
      .report { box-shadow: none; border: none; border-radius: 0; }
    }
    
    @media (max-width: 768px) {
      body { padding: 16px; }
      .header, .content, .profile-section, .footer { padding: 24px; }
      .summary-grid { grid-template-columns: 1fr; }
      .quarterly-grid { grid-template-columns: repeat(2, 1fr); }
      .category-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="report">
    <div class="header">
      <div class="header-top">
        <div class="header-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>Yagya Financial Report</span>
        </div>
        <div class="header-year">
          <div class="header-year-label">Tax Year</div>
          <div class="header-year-value">${year}</div>
        </div>
      </div>
      <h1>Income Tax Report</h1>
      <p class="subtitle">${profile.businessName || profile.name || 'Spiritual Services & Ceremonies'}</p>
    </div>
    
    ${profile.name || profile.email || profile.phone || profile.address || profile.taxId ? `
    <div class="profile-section">
      ${profile.name ? `<div class="profile-item"><span class="profile-label">Full Name</span><span class="profile-value">${profile.name}</span></div>` : ''}
      ${profile.taxId ? `<div class="profile-item"><span class="profile-label">Tax ID / PAN</span><span class="profile-value">${profile.taxId}</span></div>` : ''}
      ${profile.email ? `<div class="profile-item"><span class="profile-label">Email Address</span><span class="profile-value">${profile.email}</span></div>` : ''}
      ${profile.phone ? `<div class="profile-item"><span class="profile-label">Phone Number</span><span class="profile-value">${profile.phone}</span></div>` : ''}
      ${profile.address ? `<div class="profile-item"><span class="profile-label">Business Address</span><span class="profile-value">${profile.address}</span></div>` : ''}
    </div>
    ` : ''}
    
    <div class="content">
      <!-- Executive Summary -->
      <div class="summary-grid">
        <div class="summary-card income">
          <div class="summary-label">${REPORT_ICONS.income} Total Income</div>
          <div class="summary-amount">+${formatAmt(totalIncome)}</div>
          <div class="summary-meta">${incomeEntries.length} transaction${incomeEntries.length !== 1 ? 's' : ''} recorded</div>
        </div>
        <div class="summary-card expense">
          <div class="summary-label">${REPORT_ICONS.expense} Total Expenses</div>
          <div class="summary-amount">-${formatAmt(totalExpenses)}</div>
          <div class="summary-meta">${expenseEntries.length} transaction${expenseEntries.length !== 1 ? 's' : ''} recorded</div>
        </div>
        <div class="summary-card net">
          <div class="summary-label">${REPORT_ICONS.chart} Net Income</div>
          <div class="summary-amount">${formatAmt(netIncome)}</div>
          <div class="summary-meta">Taxable income for ${year}</div>
        </div>
      </div>
      
      <!-- Quarterly Breakdown -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon">${REPORT_ICONS.calendar}</div>
          <span class="section-title">Quarterly Financial Summary</span>
          <span class="section-desc">Income and expenses grouped by fiscal quarter</span>
        </div>
        <div class="quarterly-grid">
          ${['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => `
          <div class="quarter-card">
            <div class="quarter-label">${q} · ${['Jan–Mar', 'Apr–Jun', 'Jul–Sep', 'Oct–Dec'][i]}</div>
            <div class="quarter-row income"><span>Income</span><span>+${formatAmt(quarters[q].income)}</span></div>
            <div class="quarter-row expense"><span>Expenses</span><span>-${formatAmt(quarters[q].expenses)}</span></div>
            <div class="quarter-row net"><span>Net</span><span>${formatAmt(quarters[q].income - quarters[q].expenses)}</span></div>
          </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Monthly Summary -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon">${REPORT_ICONS.chart}</div>
          <span class="section-title">Monthly Performance</span>
          <span class="section-desc">Detailed month-by-month breakdown</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Income</th>
              <th>Expenses</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyData.map((data, i) => data.income > 0 || data.expenses > 0 ? `
            <tr>
              <td>${monthNames[i]}</td>
              <td class="income-val">+${formatAmt(data.income)}</td>
              <td class="expense-val">-${formatAmt(data.expenses)}</td>
              <td class="net-val">${formatAmt(data.income - data.expenses)}</td>
            </tr>
            ` : '').join('')}
          </tbody>
          <tfoot>
            <tr>
              <td>Annual Total</td>
              <td class="income-val">+${formatAmt(totalIncome)}</td>
              <td class="expense-val">-${formatAmt(totalExpenses)}</td>
              <td class="net-val">${formatAmt(netIncome)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <!-- Income by Category -->
      ${Object.keys(incomeByCategory).length > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-icon">${REPORT_ICONS.income}</div>
          <span class="section-title">Income by Service Category</span>
          <span class="section-desc">Revenue breakdown by ceremony type</span>
        </div>
        <div class="category-grid">
          ${Object.entries(incomeByCategory).sort((a, b) => b[1].total - a[1].total).map(([id, data]) => `
          <div class="category-item">
            <div class="category-icon" style="background: ${data.color}">${getCategoryIcon(id)}</div>
            <div class="category-info">
              <div class="category-name">${data.name}</div>
              <div class="category-count">${data.count} service${data.count !== 1 ? 's' : ''} performed</div>
            </div>
            <div class="category-amount income">+${formatAmt(data.total)}</div>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      <!-- Expenses by Category -->
      ${Object.keys(expensesByCategory).length > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-icon">${REPORT_ICONS.expense}</div>
          <span class="section-title">Expenses by Category</span>
          <span class="section-desc">Deductible expenses breakdown</span>
        </div>
        <div class="category-grid">
          ${Object.entries(expensesByCategory).sort((a, b) => b[1].total - a[1].total).map(([id, data]) => `
          <div class="category-item">
            <div class="category-icon" style="background: ${data.color}">${getCategoryIcon(id)}</div>
            <div class="category-info">
              <div class="category-name">${data.name}</div>
              <div class="category-count">${data.count} expense${data.count !== 1 ? 's' : ''}</div>
            </div>
            <div class="category-amount expense">-${formatAmt(data.total)}</div>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      <!-- Mileage Summary -->
      ${totalMiles > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-icon">${REPORT_ICONS.car}</div>
          <span class="section-title">Mileage Deduction Summary</span>
          <span class="section-desc">Business travel for tax deduction</span>
        </div>
        <div class="category-grid">
          <div class="category-item">
            <div class="category-icon" style="background: #f59e0b">${REPORT_ICONS.car}</div>
            <div class="category-info">
              <div class="category-name">Total Business Miles</div>
              <div class="category-count">IRS Rate: $0.67/mile for ${year}</div>
            </div>
            <div class="category-amount">${totalMiles.toFixed(1)} mi</div>
          </div>
          <div class="category-item">
            <div class="category-icon" style="background: #10b981">${REPORT_ICONS.income}</div>
            <div class="category-info">
              <div class="category-name">Estimated Deduction</div>
              <div class="category-count">Standard mileage rate applied</div>
            </div>
            <div class="category-amount income">${formatAmt(totalMiles * 0.67)}</div>
          </div>
        </div>
      </div>
      ` : ''}
      
      <!-- Income Transactions -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon">${REPORT_ICONS.list}</div>
          <span class="section-title">Income Transaction Ledger</span>
          <span class="section-desc">${incomeEntries.length} transaction${incomeEntries.length !== 1 ? 's' : ''} in ${year}</span>
        </div>
        <table class="tx-table">
          <thead>
            <tr>
              <th style="width:40px"></th>
              <th>Date</th>
              <th>Service / Source</th>
              <th>Address</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${incomeEntries.map(e => {
              const cat = getCategoryById(e.category)
              return `
              <tr>
                <td><div class="tx-icon" style="background:${cat.color}">${getCategoryIcon(e.category)}</div></td>
                <td class="tx-date">${formatDateStr(e.date)}</td>
                <td>${e.source || cat.name}</td>
                <td>${e.address || '-'}</td>
                <td class="tx-amount income">+${formatAmt(e.amount)}</td>
              </tr>
              `
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align:right">Total Income</td>
              <td class="tx-amount income">+${formatAmt(totalIncome)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <!-- Expense Transactions -->
      ${expenseEntries.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-icon">${REPORT_ICONS.list}</div>
          <span class="section-title">Expense Transaction Ledger</span>
          <span class="section-desc">${expenseEntries.length} expense${expenseEntries.length !== 1 ? 's' : ''} in ${year}</span>
        </div>
        <table class="tx-table">
          <thead>
            <tr>
              <th style="width:40px"></th>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Miles</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenseEntries.map(e => {
              const cat = getCategoryById(e.category)
              return `
              <tr>
                <td><div class="tx-icon" style="background:${cat.color}">${getCategoryIcon(e.category)}</div></td>
                <td class="tx-date">${formatDateStr(e.date)}</td>
                <td>${e.source || cat.name}</td>
                <td>${cat.name}</td>
                <td>${e.miles ? e.miles + ' mi' : '-'}</td>
                <td class="tx-amount expense">-${formatAmt(e.amount)}</td>
              </tr>
              `
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align:right">Total Expenses</td>
              <td class="tx-amount expense">-${formatAmt(totalExpenses)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p class="footer-generated">Report generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString()}</p>
      <p class="footer-disclaimer">This document is for informational and record-keeping purposes only. Please consult a qualified tax professional for official tax filing and advice.</p>
    </div>
  </div>
</body>
</html>
`
}

export function downloadTaxReport(entries, profile, settings, year) {
  const html = generateTaxReport(entries, profile, settings, year)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `yagya-tax-report-${year}-${profile.name?.replace(/\s+/g, '-').toLowerCase() || 'report'}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export async function emailTaxReport(entries, profile, settings, year) {
  const html = generateTaxReport(entries, profile, settings, year)
  const blob = new Blob([html], { type: 'text/html' })
  const file = new File([blob], `yagya-tax-report-${year}.html`, { type: 'text/html' })
  
  // Calculate summary data
  const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === year)
  const totalIncome = yearEntries.filter(e => e.type !== 'expense').reduce((s, e) => s + e.amount, 0)
  const totalExpenses = yearEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const netIncome = totalIncome - totalExpenses
  const currency = settings.currency || 'USD'
  
  // Try Web Share API with file first (mobile-friendly)
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Income Tax Report ${year}`,
        text: `Income Tax Report for ${year}\n\nTotal Income: ${formatCurrency(totalIncome, currency)}\nTotal Expenses: ${formatCurrency(totalExpenses, currency)}\nNet Income: ${formatCurrency(netIncome, currency)}`,
        files: [file]
      })
      return true
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('Share failed, falling back to email:', err)
      } else {
        return false
      }
    }
  }
  
  // Fallback: Download file first, then open email with instructions
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `yagya-tax-report-${year}.html`
  a.click()
  URL.revokeObjectURL(url)
  
  // Open email client with summary
  const subject = encodeURIComponent(`Income Tax Report ${year} - ${profile.name || 'Yagya'}`)
  const body = encodeURIComponent(`
INCOME TAX REPORT - ${year}
${'═'.repeat(40)}

TAXPAYER INFORMATION
────────────────────────────────────────
Name: ${profile.name || 'N/A'}
Business: ${profile.businessName || 'Spiritual Services & Ceremonies'}
${profile.taxId ? `Tax ID: ${profile.taxId}` : ''}
${profile.email ? `Email: ${profile.email}` : ''}
${profile.phone ? `Phone: ${profile.phone}` : ''}

FINANCIAL SUMMARY
────────────────────────────────────────
Total Income:    ${formatCurrency(totalIncome, currency)}
Total Expenses:  ${formatCurrency(totalExpenses, currency)}
                 ────────────────
Net Income:      ${formatCurrency(netIncome, currency)}

ATTACHMENT INSTRUCTIONS
────────────────────────────────────────
The detailed HTML report has been downloaded to your device.
Please attach the file "yagya-tax-report-${year}.html" to this email.

────────────────────────────────────────
Generated by Yagya on ${new Date().toLocaleDateString()}
  `.trim())
  
  setTimeout(() => {
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }, 500)
  
  return true
}

export async function shareTaxReport(entries, profile, settings, year) {
  const html = generateTaxReport(entries, profile, settings, year)
  const blob = new Blob([html], { type: 'text/html' })
  const file = new File([blob], `yagya-tax-report-${year}.html`, { type: 'text/html' })
  
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Tax Report ${year}`,
        text: `Income Tax Report for ${year}`,
        files: [file]
      })
      return true
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('Share failed:', err)
      }
    }
  }
  
  // Fallback to email with attachment
  return emailTaxReport(entries, profile, settings, year)
}

export function generatePDFReport(entries, profile, settings, year) {
  const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === year)
  const incomeEntries = yearEntries.filter(e => e.type !== 'expense').sort((a, b) => new Date(a.date) - new Date(b.date))
  const expenseEntries = yearEntries.filter(e => e.type === 'expense').sort((a, b) => new Date(a.date) - new Date(b.date))
  
  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
  const netIncome = totalIncome - totalExpenses
  const totalMiles = yearEntries.filter(e => e.miles).reduce((sum, e) => sum + (e.miles || 0), 0)
  
  // Group by quarter
  const quarters = { Q1: { income: 0, expenses: 0 }, Q2: { income: 0, expenses: 0 }, Q3: { income: 0, expenses: 0 }, Q4: { income: 0, expenses: 0 } }
  incomeEntries.forEach(e => { quarters[getQuarter(e.date)].income += e.amount })
  expenseEntries.forEach(e => { quarters[getQuarter(e.date)].expenses += e.amount })
  
  // Group income by category
  const incomeByCategory = {}
  incomeEntries.forEach(e => {
    const cat = getCategoryById(e.category)
    if (!incomeByCategory[cat.id]) incomeByCategory[cat.id] = { name: cat.name, total: 0, count: 0, color: cat.color }
    incomeByCategory[cat.id].total += e.amount
    incomeByCategory[cat.id].count++
  })
  
  // Group expenses by category
  const expensesByCategory = {}
  expenseEntries.forEach(e => {
    const cat = getCategoryById(e.category)
    if (!expensesByCategory[cat.id]) expensesByCategory[cat.id] = { name: cat.name, total: 0, count: 0, color: cat.color }
    expensesByCategory[cat.id].total += e.amount
    expensesByCategory[cat.id].count++
  })

  // Monthly breakdown
  const monthlyData = Array(12).fill(null).map(() => ({ income: 0, expenses: 0 }))
  yearEntries.forEach(e => {
    const month = new Date(e.date).getMonth()
    if (e.type === 'expense') monthlyData[month].expenses += e.amount
    else monthlyData[month].income += e.amount
  })

  const currency = settings.currency || 'USD'
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  const symbol = symbols[currency] || '$'
  
  const formatAmt = (amt) => formatCurrency(amt, currency)
  const formatDateStr = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Report ${year} - ${profile.name || 'Yagya'}</title>
  <style>
    @page {
      size: letter;
      margin: 0.6in 0.5in;
    }
    
    :root {
      --text-primary: #0a0a0a;
      --text-secondary: #525252;
      --text-muted: #737373;
      --border: #e5e5e5;
      --border-strong: #d4d4d4;
      --bg-subtle: #fafafa;
      --bg-muted: #f5f5f5;
      --accent: #0a0a0a;
      --income: #16a34a;
      --income-bg: #f0fdf4;
      --expense: #dc2626;
      --expense-bg: #fef2f2;
      --net: #2563eb;
      --net-bg: #eff6ff;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: var(--text-primary);
      line-height: 1.4;
      font-size: 9pt;
      background: white;
    }
    
    .page {
      page-break-after: always;
      min-height: 100vh;
      position: relative;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    /* Header - Clean, Professional */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      margin-bottom: 24px;
      border-bottom: 3px solid var(--accent);
    }
    
    .header-left h1 {
      font-size: 22pt;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    
    .header-left .subtitle {
      font-size: 10pt;
      color: var(--text-secondary);
      font-weight: 400;
    }
    
    .header-right {
      text-align: right;
    }
    
    .header-right .label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-bottom: 2px;
    }
    
    .header-right .year {
      font-size: 28pt;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: -1px;
    }
    
    /* Profile Bar */
    .profile-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      padding: 16px 20px;
      background: var(--bg-muted);
      border: 1px solid var(--border);
      border-radius: 6px;
      margin-bottom: 24px;
    }
    
    .profile-item {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    
    .profile-label {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }
    
    .profile-value {
      font-size: 9pt;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    /* Summary Cards */
    .summary-row {
      display: flex;
      gap: 12px;
      margin-bottom: 28px;
    }
    
    .summary-card {
      flex: 1;
      padding: 18px 16px;
      border-radius: 6px;
      border: 1px solid var(--border);
    }
    
    .summary-card.income { background: var(--income-bg); border-color: #bbf7d0; }
    .summary-card.expense { background: var(--expense-bg); border-color: #fecaca; }
    .summary-card.net { background: var(--net-bg); border-color: #bfdbfe; }
    .summary-card.mileage { background: #fffbeb; border-color: #fde68a; }
    
    .summary-card .label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    
    .summary-card .label svg {
      width: 12px;
      height: 12px;
    }
    
    .summary-card.income .label { color: #166534; }
    .summary-card.expense .label { color: #991b1b; }
    .summary-card.net .label { color: #1e40af; }
    .summary-card.mileage .label { color: #92400e; }
    
    .summary-card .amount {
      font-size: 18pt;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 2px;
    }
    
    .summary-card.income .amount { color: #15803d; }
    .summary-card.expense .amount { color: #b91c1c; }
    .summary-card.net .amount { color: #1d4ed8; }
    .summary-card.mileage .amount { color: #b45309; }
    
    .summary-card .meta {
      font-size: 7pt;
      color: var(--text-muted);
    }
    
    /* Section */
    .section {
      margin-bottom: 24px;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--accent);
    }
    
    .section-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: var(--accent);
      color: white;
      border-radius: 4px;
    }
    
    .section-icon svg {
      width: 14px;
      height: 14px;
    }
    
    .section-title {
      font-size: 11pt;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .section-desc {
      font-size: 8pt;
      color: var(--text-muted);
      margin-left: auto;
    }
    
    /* Quarterly Grid */
    .quarterly-grid {
      display: flex;
      gap: 10px;
    }
    
    .quarter-card {
      flex: 1;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 14px;
    }
    
    .quarter-card .q-label {
      font-size: 10pt;
      font-weight: 700;
      text-align: center;
      color: var(--text-primary);
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border);
    }
    
    .quarter-card .q-row {
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      padding: 3px 0;
    }
    
    .quarter-card .q-row.income { color: var(--income); }
    .quarter-card .q-row.expense { color: var(--expense); }
    .quarter-card .q-row.net {
      font-weight: 700;
      color: var(--text-primary);
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid var(--border);
    }
    
    /* Data Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    
    .data-table th {
      text-align: left;
      padding: 8px 10px;
      background: var(--bg-muted);
      font-weight: 700;
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      border-bottom: 2px solid var(--border-strong);
    }
    
    .data-table td {
      padding: 7px 10px;
      border-bottom: 1px solid var(--border);
    }
    
    .data-table .income-val { color: var(--income); font-weight: 600; }
    .data-table .expense-val { color: var(--expense); font-weight: 600; }
    .data-table .net-val { font-weight: 700; }
    
    .data-table tfoot td {
      background: var(--bg-muted);
      font-weight: 700;
      border-bottom: none;
    }
    
    /* Category Grid */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    
    .category-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 6px;
    }
    
    .category-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 5px;
      color: white;
      flex-shrink: 0;
    }
    
    .category-icon svg {
      width: 14px;
      height: 14px;
    }
    
    .category-info {
      flex: 1;
      min-width: 0;
    }
    
    .category-name {
      font-size: 8pt;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .category-count {
      font-size: 7pt;
      color: var(--text-muted);
    }
    
    .category-amount {
      font-size: 9pt;
      font-weight: 700;
      white-space: nowrap;
    }
    
    .category-amount.income { color: var(--income); }
    .category-amount.expense { color: var(--expense); }
    
    /* Transaction Table */
    .tx-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
    }
    
    .tx-table th {
      text-align: left;
      padding: 6px 8px;
      background: var(--bg-muted);
      font-weight: 700;
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      border-bottom: 2px solid var(--border-strong);
    }
    
    .tx-table td {
      padding: 5px 8px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    
    .tx-table .tx-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      color: white;
    }
    
    .tx-table .tx-icon svg {
      width: 11px;
      height: 11px;
    }
    
    .tx-table .tx-date {
      color: var(--text-muted);
      font-size: 7pt;
      white-space: nowrap;
    }
    
    .tx-table .tx-amount {
      font-weight: 600;
      text-align: right;
      white-space: nowrap;
    }
    
    .tx-table .tx-amount.income { color: var(--income); }
    .tx-table .tx-amount.expense { color: var(--expense); }
    
    .tx-table tfoot td {
      background: var(--bg-muted);
      font-weight: 700;
      font-size: 8pt;
    }
    
    /* Footer */
    .footer {
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      text-align: center;
    }
    
    .footer .generated {
      font-size: 7pt;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    
    .footer .disclaimer {
      font-size: 7pt;
      color: var(--text-muted);
      font-style: italic;
    }
    
    /* Print Controls */
    .print-controls {
      position: fixed;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
      z-index: 1000;
    }
    
    .print-btn {
      padding: 10px 20px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }
    
    .print-btn:hover {
      background: #262626;
    }
    
    .print-btn svg {
      width: 16px;
      height: 16px;
    }
    
    @media print {
      .print-controls { display: none !important; }
      body { background: white; padding: 0; }
    }
    
    @media screen {
      body {
        background: #d4d4d4;
        padding: 24px;
      }
      
      .page {
        max-width: 8.5in;
        margin: 0 auto 24px auto;
        background: white;
        padding: 0.6in 0.5in;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="print-controls">
    <button class="print-btn" onclick="window.print()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
      Save as PDF
    </button>
  </div>

  <!-- Page 1: Summary -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        <h1>Income Tax Report</h1>
        <div class="subtitle">${profile.businessName || profile.name || 'Spiritual Services & Ceremonies'}</div>
      </div>
      <div class="header-right">
        <div class="label">Tax Year</div>
        <div class="year">${year}</div>
      </div>
    </div>
    
    ${profile.name || profile.email || profile.phone || profile.address || profile.taxId ? `
    <div class="profile-bar">
      ${profile.name ? `<div class="profile-item"><span class="profile-label">Full Name</span><span class="profile-value">${profile.name}</span></div>` : ''}
      ${profile.taxId ? `<div class="profile-item"><span class="profile-label">Tax ID / PAN</span><span class="profile-value">${profile.taxId}</span></div>` : ''}
      ${profile.email ? `<div class="profile-item"><span class="profile-label">Email</span><span class="profile-value">${profile.email}</span></div>` : ''}
      ${profile.phone ? `<div class="profile-item"><span class="profile-label">Phone</span><span class="profile-value">${profile.phone}</span></div>` : ''}
      ${profile.address ? `<div class="profile-item"><span class="profile-label">Address</span><span class="profile-value">${profile.address}</span></div>` : ''}
    </div>
    ` : ''}
    
    <div class="summary-row">
      <div class="summary-card income">
        <div class="label">${REPORT_ICONS.income} Total Income</div>
        <div class="amount">+${formatAmt(totalIncome)}</div>
        <div class="meta">${incomeEntries.length} transactions</div>
      </div>
      <div class="summary-card expense">
        <div class="label">${REPORT_ICONS.expense} Total Expenses</div>
        <div class="amount">-${formatAmt(totalExpenses)}</div>
        <div class="meta">${expenseEntries.length} transactions</div>
      </div>
      <div class="summary-card net">
        <div class="label">${REPORT_ICONS.chart} Net Income</div>
        <div class="amount">${formatAmt(netIncome)}</div>
        <div class="meta">Taxable amount</div>
      </div>
      ${totalMiles > 0 ? `
      <div class="summary-card mileage">
        <div class="label">${REPORT_ICONS.car} Mileage</div>
        <div class="amount">${totalMiles.toFixed(0)} mi</div>
        <div class="meta">≈${formatAmt(totalMiles * 0.67)} deduction</div>
      </div>
      ` : ''}
    </div>
    
    <div class="section">
      <div class="section-header">
        <div class="section-icon">${REPORT_ICONS.calendar}</div>
        <span class="section-title">Quarterly Financial Summary</span>
        <span class="section-desc">Fiscal quarters ${year}</span>
      </div>
      <div class="quarterly-grid">
        ${['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => `
        <div class="quarter-card">
          <div class="q-label">${q} · ${['Jan–Mar', 'Apr–Jun', 'Jul–Sep', 'Oct–Dec'][i]}</div>
          <div class="q-row income"><span>Income</span><span>+${formatAmt(quarters[q].income)}</span></div>
          <div class="q-row expense"><span>Expenses</span><span>-${formatAmt(quarters[q].expenses)}</span></div>
          <div class="q-row net"><span>Net</span><span>${formatAmt(quarters[q].income - quarters[q].expenses)}</span></div>
        </div>
        `).join('')}
      </div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <div class="section-icon">${REPORT_ICONS.chart}</div>
        <span class="section-title">Monthly Performance</span>
        <span class="section-desc">Month-by-month breakdown</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Month</th>
            <th style="text-align:right">Income</th>
            <th style="text-align:right">Expenses</th>
            <th style="text-align:right">Net</th>
          </tr>
        </thead>
        <tbody>
          ${monthlyData.map((data, i) => data.income > 0 || data.expenses > 0 ? `
          <tr>
            <td>${monthNamesFull[i]}</td>
            <td class="income-val" style="text-align:right">+${formatAmt(data.income)}</td>
            <td class="expense-val" style="text-align:right">-${formatAmt(data.expenses)}</td>
            <td class="net-val" style="text-align:right">${formatAmt(data.income - data.expenses)}</td>
          </tr>
          ` : '').join('')}
        </tbody>
        <tfoot>
          <tr>
            <td>Annual Total</td>
            <td class="income-val" style="text-align:right">+${formatAmt(totalIncome)}</td>
            <td class="expense-val" style="text-align:right">-${formatAmt(totalExpenses)}</td>
            <td class="net-val" style="text-align:right">${formatAmt(netIncome)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    ${Object.keys(incomeByCategory).length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-icon">${REPORT_ICONS.income}</div>
        <span class="section-title">Income by Service Category</span>
        <span class="section-desc">Revenue by ceremony type</span>
      </div>
      <div class="category-grid">
        ${Object.entries(incomeByCategory).sort((a, b) => b[1].total - a[1].total).map(([id, data]) => `
        <div class="category-item">
          <div class="category-icon" style="background:${data.color}">${getCategoryIcon(id)}</div>
          <div class="category-info">
            <div class="category-name">${data.name}</div>
            <div class="category-count">${data.count} service${data.count !== 1 ? 's' : ''}</div>
          </div>
          <div class="category-amount income">+${formatAmt(data.total)}</div>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    ${Object.keys(expensesByCategory).length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-icon">${REPORT_ICONS.expense}</div>
        <span class="section-title">Expenses by Category</span>
        <span class="section-desc">Deductible business expenses</span>
      </div>
      <div class="category-grid">
        ${Object.entries(expensesByCategory).sort((a, b) => b[1].total - a[1].total).map(([id, data]) => `
        <div class="category-item">
          <div class="category-icon" style="background:${data.color}">${getCategoryIcon(id)}</div>
          <div class="category-info">
            <div class="category-name">${data.name}</div>
            <div class="category-count">${data.count} expense${data.count !== 1 ? 's' : ''}</div>
          </div>
          <div class="category-amount expense">-${formatAmt(data.total)}</div>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  </div>
  
  <!-- Page 2: Transaction Ledger -->
  <div class="page">
    <div class="section">
      <div class="section-header">
        <div class="section-icon">${REPORT_ICONS.list}</div>
        <span class="section-title">Income Transaction Ledger</span>
        <span class="section-desc">${incomeEntries.length} transaction${incomeEntries.length !== 1 ? 's' : ''} in ${year}</span>
      </div>
      <table class="tx-table">
        <thead>
          <tr>
            <th style="width:28px"></th>
            <th style="width:65px">Date</th>
            <th>Service / Source</th>
            <th>Address</th>
            <th style="text-align:right;width:80px">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${incomeEntries.map(e => {
            const cat = getCategoryById(e.category)
            return `
            <tr>
              <td><div class="tx-icon" style="background:${cat.color}">${getCategoryIcon(e.category)}</div></td>
              <td class="tx-date">${formatDateStr(e.date)}</td>
              <td>${e.source || cat.name}</td>
              <td>${e.address || '-'}</td>
              <td class="tx-amount income">+${formatAmt(e.amount)}</td>
            </tr>
            `
          }).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:right">Total Income</td>
            <td class="tx-amount income">+${formatAmt(totalIncome)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    ${expenseEntries.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-icon">${REPORT_ICONS.list}</div>
        <span class="section-title">Expense Transaction Ledger</span>
        <span class="section-desc">${expenseEntries.length} expense${expenseEntries.length !== 1 ? 's' : ''} in ${year}</span>
      </div>
      <table class="tx-table">
        <thead>
          <tr>
            <th style="width:28px"></th>
            <th style="width:65px">Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Miles</th>
            <th style="text-align:right;width:80px">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenseEntries.map(e => {
            const cat = getCategoryById(e.category)
            return `
            <tr>
              <td><div class="tx-icon" style="background:${cat.color}">${getCategoryIcon(e.category)}</div></td>
              <td class="tx-date">${formatDateStr(e.date)}</td>
              <td>${e.source || cat.name}</td>
              <td>${cat.name}</td>
              <td>${e.miles ? e.miles + ' mi' : '-'}</td>
              <td class="tx-amount expense">-${formatAmt(e.amount)}</td>
            </tr>
            `
          }).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="text-align:right">Total Expenses</td>
            <td class="tx-amount expense">-${formatAmt(totalExpenses)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    ` : ''}
    
    <div class="footer">
      <div class="generated">Report generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString()}</div>
      <div class="disclaimer">This document is for informational and record-keeping purposes only. Please consult a qualified tax professional for official tax filing and advice.</div>
    </div>
  </div>
</body>
</html>
`
  
  return html
}

export function downloadPDF(entries, profile, settings, year) {
  const html = generatePDFReport(entries, profile, settings, year)
  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}
