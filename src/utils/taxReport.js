import { formatCurrency, getMonthFullName, getQuarter } from './format'
import { getCategoryById } from './categories'

export function generateTaxReport(entries, profile, settings, year) {
  const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === year)
  const incomeEntries = yearEntries.filter(e => e.type !== 'expense').sort((a, b) => new Date(a.date) - new Date(b.date))
  const expenseEntries = yearEntries.filter(e => e.type === 'expense').sort((a, b) => new Date(a.date) - new Date(b.date))
  
  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
  const netIncome = totalIncome - totalExpenses
  
  // Group by quarter
  const quarters = { Q1: { income: 0, expenses: 0 }, Q2: { income: 0, expenses: 0 }, Q3: { income: 0, expenses: 0 }, Q4: { income: 0, expenses: 0 } }
  incomeEntries.forEach(e => { quarters[getQuarter(e.date)].income += e.amount })
  expenseEntries.forEach(e => { quarters[getQuarter(e.date)].expenses += e.amount })
  
  // Group by month
  const monthlyData = {}
  yearEntries.forEach(e => {
    const month = new Date(e.date).getMonth()
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 }
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
    if (!incomeByCategory[cat.name]) incomeByCategory[cat.name] = { total: 0, count: 0, icon: cat.icon }
    incomeByCategory[cat.name].total += e.amount
    incomeByCategory[cat.name].count++
  })
  
  // Group expenses by category
  const expensesByCategory = {}
  expenseEntries.forEach(e => {
    const cat = getCategoryById(e.category)
    if (!expensesByCategory[cat.name]) expensesByCategory[cat.name] = { total: 0, count: 0, icon: cat.icon }
    expensesByCategory[cat.name].total += e.amount
    expensesByCategory[cat.name].count++
  })

  const currency = settings.currency || 'USD'
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  const symbol = symbols[currency] || '$'
  
  const formatAmt = (amt) => formatCurrency(amt, currency)
  const formatDateStr = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Income Tax Report ${year} - ${profile.name || 'Guruji'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
      padding: 40px 20px;
    }
    
    .report {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 16px;
      opacity: 0.8;
    }
    
    .header .year-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 8px 20px;
      border-radius: 20px;
      margin-top: 16px;
      font-size: 18px;
      font-weight: 600;
    }
    
    .profile-section {
      background: #f1f5f9;
      padding: 24px 40px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .profile-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .profile-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    
    .profile-value {
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
    }
    
    .content {
      padding: 40px;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 40px;
    }
    
    .summary-card {
      padding: 24px;
      border-radius: 12px;
      text-align: center;
    }
    
    .summary-card.income {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #a7f3d0;
    }
    
    .summary-card.expense {
      background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
      border: 1px solid #fca5a5;
    }
    
    .summary-card.net {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid #93c5fd;
    }
    
    .summary-card .label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    
    .summary-card.income .label { color: #059669; }
    .summary-card.expense .label { color: #dc2626; }
    .summary-card.net .label { color: #2563eb; }
    
    .summary-card .amount {
      font-size: 28px;
      font-weight: 600;
    }
    
    .summary-card.income .amount { color: #047857; }
    .summary-card.expense .amount { color: #b91c1c; }
    .summary-card.net .amount { color: #1d4ed8; }
    
    .summary-card .count {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    
    .section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-icon {
      font-size: 20px;
    }
    
    .quarterly-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    
    .quarter-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    
    .quarter-card .q-label {
      font-size: 14px;
      font-weight: 600;
      color: #3b82f6;
      margin-bottom: 12px;
    }
    
    .quarter-card .q-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px 0;
    }
    
    .quarter-card .q-income { color: #059669; }
    .quarter-card .q-expense { color: #dc2626; }
    .quarter-card .q-net {
      font-weight: 600;
      border-top: 1px solid #e2e8f0;
      margin-top: 8px;
      padding-top: 8px;
    }
    
    .category-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .category-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
    }
    
    .category-icon {
      font-size: 24px;
    }
    
    .category-info {
      flex: 1;
    }
    
    .category-name {
      font-size: 13px;
      font-weight: 500;
    }
    
    .category-count {
      font-size: 11px;
      color: #64748b;
    }
    
    .category-amount {
      font-size: 14px;
      font-weight: 600;
    }
    
    .category-amount.income { color: #059669; }
    .category-amount.expense { color: #dc2626; }
    
    .transactions-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    
    .transactions-table th {
      text-align: left;
      padding: 12px;
      background: #f1f5f9;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .transactions-table td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    
    .transactions-table tr:hover {
      background: #f8fafc;
    }
    
    .transactions-table .amount-cell {
      font-weight: 600;
      text-align: right;
    }
    
    .transactions-table .amount-cell.income { color: #059669; }
    .transactions-table .amount-cell.expense { color: #dc2626; }
    
    .transactions-table .icon-cell {
      width: 40px;
      font-size: 18px;
    }
    
    .transactions-table .date-cell {
      color: #64748b;
      font-size: 12px;
    }
    
    .footer {
      background: #f1f5f9;
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    
    .footer .generated {
      margin-bottom: 8px;
    }
    
    .footer .disclaimer {
      font-style: italic;
    }
    
    @media print {
      body { padding: 0; background: white; }
      .report { box-shadow: none; border-radius: 0; }
    }
    
    @media (max-width: 600px) {
      .summary-cards { grid-template-columns: 1fr; }
      .quarterly-grid { grid-template-columns: repeat(2, 1fr); }
      .category-grid { grid-template-columns: 1fr; }
      .header, .content, .profile-section, .footer { padding: 24px; }
    }
  </style>
</head>
<body>
  <div class="report">
    <div class="header">
      <h1>Income Tax Report</h1>
      <p class="subtitle">${profile.businessName || 'Spiritual Services & Teaching'}</p>
      <div class="year-badge">Tax Year ${year}</div>
    </div>
    
    ${profile.name ? `
    <div class="profile-section">
      <div class="profile-item">
        <span class="profile-label">Name</span>
        <span class="profile-value">${profile.name}</span>
      </div>
      ${profile.email ? `
      <div class="profile-item">
        <span class="profile-label">Email</span>
        <span class="profile-value">${profile.email}</span>
      </div>
      ` : ''}
      ${profile.phone ? `
      <div class="profile-item">
        <span class="profile-label">Phone</span>
        <span class="profile-value">${profile.phone}</span>
      </div>
      ` : ''}
      ${profile.address ? `
      <div class="profile-item">
        <span class="profile-label">Address</span>
        <span class="profile-value">${profile.address}</span>
      </div>
      ` : ''}
      ${profile.taxId ? `
      <div class="profile-item">
        <span class="profile-label">Tax ID / PAN</span>
        <span class="profile-value">${profile.taxId}</span>
      </div>
      ` : ''}
    </div>
    ` : ''}
    
    <div class="content">
      <div class="summary-cards">
        <div class="summary-card income">
          <div class="label">Total Income</div>
          <div class="amount">${formatAmt(totalIncome)}</div>
          <div class="count">${incomeEntries.length} transactions</div>
        </div>
        <div class="summary-card expense">
          <div class="label">Total Expenses</div>
          <div class="amount">${formatAmt(totalExpenses)}</div>
          <div class="count">${expenseEntries.length} transactions</div>
        </div>
        <div class="summary-card net">
          <div class="label">Net Income</div>
          <div class="amount">${formatAmt(netIncome)}</div>
          <div class="count">Taxable amount</div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title"><span class="section-icon">📊</span> Quarterly Summary</h2>
        <div class="quarterly-grid">
          ${['Q1', 'Q2', 'Q3', 'Q4'].map(q => `
          <div class="quarter-card">
            <div class="q-label">${q}</div>
            <div class="q-row q-income">
              <span>Income</span>
              <span>+${formatAmt(quarters[q].income)}</span>
            </div>
            <div class="q-row q-expense">
              <span>Expenses</span>
              <span>-${formatAmt(quarters[q].expenses)}</span>
            </div>
            <div class="q-row q-net">
              <span>Net</span>
              <span>${formatAmt(quarters[q].income - quarters[q].expenses)}</span>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title"><span class="section-icon">💰</span> Income by Category</h2>
        <div class="category-grid">
          ${Object.entries(incomeByCategory).map(([name, data]) => `
          <div class="category-card">
            <span class="category-icon">${data.icon}</span>
            <div class="category-info">
              <div class="category-name">${name}</div>
              <div class="category-count">${data.count} transactions</div>
            </div>
            <div class="category-amount income">+${formatAmt(data.total)}</div>
          </div>
          `).join('')}
        </div>
      </div>
      
      ${Object.keys(expensesByCategory).length > 0 ? `
      <div class="section">
        <h2 class="section-title"><span class="section-icon">💸</span> Expenses by Category</h2>
        <div class="category-grid">
          ${Object.entries(expensesByCategory).map(([name, data]) => `
          <div class="category-card">
            <span class="category-icon">${data.icon}</span>
            <div class="category-info">
              <div class="category-name">${name}</div>
              <div class="category-count">${data.count} transactions</div>
            </div>
            <div class="category-amount expense">-${formatAmt(data.total)}</div>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      <div class="section">
        <h2 class="section-title"><span class="section-icon">📋</span> Income Transactions</h2>
        <table class="transactions-table">
          <thead>
            <tr>
              <th></th>
              <th>Date</th>
              <th>Source</th>
              <th>Notes</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${incomeEntries.map(e => {
              const cat = getCategoryById(e.category)
              return `
              <tr>
                <td class="icon-cell">${cat.icon}</td>
                <td class="date-cell">${formatDateStr(e.date)}</td>
                <td>${e.source || cat.name}</td>
                <td>${e.notes || '-'}</td>
                <td class="amount-cell income">+${formatAmt(e.amount)}</td>
              </tr>
              `
            }).join('')}
            <tr style="background:#ecfdf5;font-weight:600">
              <td colspan="4" style="text-align:right">Total Income</td>
              <td class="amount-cell income">+${formatAmt(totalIncome)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      ${expenseEntries.length > 0 ? `
      <div class="section">
        <h2 class="section-title"><span class="section-icon">📋</span> Expense Transactions</h2>
        <table class="transactions-table">
          <thead>
            <tr>
              <th></th>
              <th>Date</th>
              <th>Description</th>
              <th>Related To</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenseEntries.map(e => {
              const cat = getCategoryById(e.category)
              const relatedJob = e.relatedTo ? entries.find(x => x.id === e.relatedTo) : null
              return `
              <tr>
                <td class="icon-cell">${cat.icon}</td>
                <td class="date-cell">${formatDateStr(e.date)}</td>
                <td>${e.source || cat.name}</td>
                <td>${relatedJob ? relatedJob.source : '-'}</td>
                <td class="amount-cell expense">-${formatAmt(e.amount)}</td>
              </tr>
              `
            }).join('')}
            <tr style="background:#fef2f2;font-weight:600">
              <td colspan="4" style="text-align:right">Total Expenses</td>
              <td class="amount-cell expense">-${formatAmt(totalExpenses)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p class="generated">Report generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${new Date().toLocaleTimeString()}</p>
      <p class="disclaimer">This report is for informational purposes only. Please consult a tax professional for official tax filing.</p>
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
  a.download = `tax-report-${year}-${profile.name?.replace(/\s+/g, '-') || 'guruji'}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export function emailTaxReport(entries, profile, settings, year) {
  const totalIncome = entries.filter(e => e.type !== 'expense' && new Date(e.date).getFullYear() === year).reduce((s, e) => s + e.amount, 0)
  const totalExpenses = entries.filter(e => e.type === 'expense' && new Date(e.date).getFullYear() === year).reduce((s, e) => s + e.amount, 0)
  const netIncome = totalIncome - totalExpenses
  const currency = settings.currency || 'USD'
  
  const subject = encodeURIComponent(`Income Tax Report ${year} - ${profile.name || 'Guruji'}`)
  const body = encodeURIComponent(`
Income Tax Report Summary for ${year}

Name: ${profile.name || 'N/A'}
Business: ${profile.businessName || 'Spiritual Services'}
${profile.taxId ? `Tax ID: ${profile.taxId}` : ''}

SUMMARY
-------
Total Income: ${formatCurrency(totalIncome, currency)}
Total Expenses: ${formatCurrency(totalExpenses, currency)}
Net Income: ${formatCurrency(netIncome, currency)}

Please find the detailed report attached or download it from the Guruji Income Tracker app.

Generated on: ${new Date().toLocaleDateString()}
  `.trim())
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

export async function shareTaxReport(entries, profile, settings, year) {
  const html = generateTaxReport(entries, profile, settings, year)
  const blob = new Blob([html], { type: 'text/html' })
  const file = new File([blob], `tax-report-${year}.html`, { type: 'text/html' })
  
  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Tax Report ${year}`,
        text: `Income Tax Report for ${year}`,
        files: [file]
      })
      return true
    } catch (err) {
      console.log('Share failed:', err)
    }
  }
  
  // Fallback to email
  emailTaxReport(entries, profile, settings, year)
  return false
}

