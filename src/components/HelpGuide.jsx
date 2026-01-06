import { useState } from 'react'
import { CloseIcon, ChevronRightIcon } from './Icons'
import { t } from '../utils/translations'

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    titleHi: 'शुरू करना',
    titleNe: 'सुरु गर्दै',
    icon: '🚀',
    content: `
**Welcome to Dakshina**

Dakshina is your personal income and expense tracker, designed specifically for spiritual service providers, priests, pandits, and gurujis. Track your earnings, manage expenses, schedule services, and generate tax reports—all in one beautiful, secure app.

**First Steps**

1. **Add Your Profile** — Go to Settings and tap your profile card to add your name, business name, and contact details. This information appears on your tax documents.

2. **Set Your Preferences** — Choose your preferred language (English, Hindi, or Nepali), currency, and theme (light or dark mode).

3. **Enable Security** — Set up a PIN lock to keep your financial data private.

**Quick Overview**

• **Home** — Your dashboard with income summary, calendar, and recent transactions
• **Reports** — Visual breakdowns of your income and expenses
• **Tax Center** — Generate tax reports and export data
• **Settings** — Manage your profile, preferences, and data
    `
  },
  {
    id: 'adding-income',
    title: 'Recording Income',
    titleHi: 'आय दर्ज करना',
    titleNe: 'आम्दानी रेकर्ड गर्दै',
    icon: '💰',
    content: `
**Adding Income Entries**

Tap the **"+ Add Transaction"** button on the Home screen to record income.

**Step-by-Step:**

1. **Select Type** — Choose "Income" (green arrow up)

2. **Enter Amount** — Type the amount received

3. **Add Payer Name** — Record who paid you (e.g., "Sharma Family", "Ram Temple")

4. **Select Payment Method** — Choose from:
   • Cash
   • Check
   • Card
   • Bank Transfer
   • UPI
   • Other

5. **Choose Category** — Select what type of service:
   • Puja/Worship
   • Teaching/Classes
   • Consultation
   • Ceremonies (Wedding, etc.)
   • Donations
   • And more...

6. **Set Date** — Defaults to today, but you can backdate

7. **Add Notes** — Optional details about the service

8. **Save** — Tap "Save Entry" to record

**Pro Tips:**

• Be consistent with payer names for better reports
• Add notes for special ceremonies to remember details
• Use categories to track which services earn most
    `
  },
  {
    id: 'tracking-expenses',
    title: 'Tracking Expenses',
    titleHi: 'खर्च ट्रैक करना',
    titleNe: 'खर्च ट्र्याक गर्दै',
    icon: '📉',
    content: `
**Recording Expenses**

Track business-related expenses to reduce your taxable income.

**Adding an Expense:**

1. Tap **"+ Add Transaction"**
2. Select **"Expense"** (red arrow down)
3. Enter the amount spent
4. Choose payment method
5. Select expense category:
   • Supplies (flowers, incense, etc.)
   • Travel/Transport
   • Equipment
   • Office/Admin
   • Professional fees
   • And more...

**Linking Expenses to Jobs**

When adding an expense, you can link it to a specific income entry. This helps you:

• See the **true profit** from each job
• Track job-specific costs
• Generate accurate profitability reports

**To link an expense:**
1. When adding expense, scroll to "Related Job"
2. Select the income entry this expense belongs to
3. The expense will appear nested under that income

**Mileage Tracking**

For travel expenses, use the built-in mileage calculator:

1. In the expense form, find "Mileage Expense"
2. Enter your destination address
3. Tap "Calculate" to get the distance
4. The app calculates your deduction using the IRS standard rate ($0.67/mile for 2024)

Your home address is pre-set. Total mileage appears in Reports.
    `
  },
  {
    id: 'calendar-scheduling',
    title: 'Calendar & Scheduling',
    titleHi: 'कैलेंडर और शेड्यूलिंग',
    titleNe: 'क्यालेन्डर र तालिका',
    icon: '📅',
    content: `
**Using the Calendar**

The calendar on your Home screen shows:
• **White dots** — Days with past transactions
• **Yellow dots** — Days with scheduled services

**Viewing a Day**

Tap any day to see:
• Transactions recorded on that date
• Scheduled services for that date
• Option to add new entries or services

**Scheduling Future Services**

Plan ahead by scheduling upcoming services:

1. Tap **"Schedule Service"** button, or
2. Tap a future date on the calendar

**Service Details:**

• **Client Name** — Who you're serving
• **Date** — When the service is scheduled
• **Time** — Select from dropdown (1 PM, 2 PM, etc.)
• **Service Type** — Puja, ceremony, consultation, etc.
• **Address** — Where the service will be
• **Point of Contact** — Phone number or name
• **Notes** — Special instructions or requirements

**Managing Scheduled Services:**

• Tap a yellow dot to view scheduled services
• Edit or delete services as needed
• After completing a service, add it as an income entry

**Best Practices:**

• Schedule services as soon as they're booked
• Add complete address and contact details
• Use notes for special requirements (dietary, timing, materials needed)
    `
  },
  {
    id: 'reports-analytics',
    title: 'Reports & Analytics',
    titleHi: 'रिपोर्ट और विश्लेषण',
    titleNe: 'रिपोर्ट र विश्लेषण',
    icon: '📊',
    content: `
**Understanding Your Reports**

The Reports tab gives you insights into your financial health.

**Three Report Views:**

**1. Overview**
• Total Income, Expenses, and Net Income
• Monthly income vs. expense chart
• Payment method breakdown
• Key statistics (profit margin, averages)
• Total mileage tracked

**2. Income Tab**
• Income breakdown by source/category
• Visual bar charts
• See which services earn most
• Track unique income sources

**3. Expenses Tab**
• Expenses by category
• Mileage tracking summary
• IRS deduction estimates
• Expense patterns

**Key Metrics Explained:**

• **Net Income** = Total Income - Total Expenses
• **Profit Margin** = (Net Income ÷ Total Income) × 100
• **Mileage Deduction** = Total Miles × IRS Rate

**Using Reports for Growth:**

1. **Identify top services** — Focus on what earns most
2. **Track seasonal patterns** — Plan for busy/slow periods
3. **Monitor expenses** — Keep costs under control
4. **Optimize pricing** — Know your true profit per service
    `
  },
  {
    id: 'tax-center',
    title: 'Tax Center',
    titleHi: 'कर केंद्र',
    titleNe: 'कर केन्द्र',
    icon: '🏛️',
    content: `
**Managing Your Taxes**

The Tax Center helps you prepare for tax season.

**Annual Summary**

Select any year to see:
• Total income for that year
• Total expenses
• Net taxable income
• Quarterly breakdown

**Quarterly View**

See income and expenses by quarter:
• **Q1** — January to March
• **Q2** — April to June
• **Q3** — July to September
• **Q4** — October to December

Useful for quarterly estimated tax payments.

**Estimated Tax**

The app provides a rough tax estimate based on:
• Your net income
• A simplified 25% tax rate
• Quarterly payment suggestions

*Note: This is an estimate only. Consult a tax professional for accurate calculations.*

**Generating Tax Reports**

**Download PDF:**
1. Tap "Download PDF"
2. A print dialog opens
3. Select "Save as PDF" or print directly

**Preview Report:**
Opens a detailed HTML report in your browser with:
• Your profile information
• Annual summary
• Quarterly breakdown
• Category analysis
• Complete transaction list

**Export Options:**

• **Download HTML** — Save the full report
• **Email Report** — Send via email
• **Share Report** — Share to other apps
• **Download CSV** — Spreadsheet format for accountants
    `
  },
  {
    id: 'data-backup',
    title: 'Backup & Security',
    titleHi: 'बैकअप और सुरक्षा',
    titleNe: 'ब्याकअप र सुरक्षा',
    icon: '🔒',
    content: `
**Protecting Your Data**

Your financial data is valuable. Keep it safe.

**PIN Lock**

Enable a 4-digit PIN to secure the app:

1. Go to **Settings → Security**
2. Tap **"PIN Lock"**
3. Enter a 4-digit PIN
4. Confirm your PIN
5. The app will now require PIN on launch

**Changing or Removing PIN:**
• **Change PIN** — Verify current PIN, then set new one
• **Remove PIN** — Verify PIN to disable lock

**Backing Up Data**

**Local Backup:**
1. Go to **Settings → Data**
2. Tap **"Backup Data"**
3. A JSON file downloads with all your data
4. Store this file safely (cloud drive, computer)

**Cloud Backup:**
1. Tap **"Cloud Backup"**
2. Choose your method:
   • **Google Sheets** — Export as spreadsheet
   • **Google Drive** — Save backup file
   • **Email** — Send backup to yourself

**Restoring Data:**
1. Go to **Settings → Data**
2. Tap **"Restore Backup"**
3. Select your backup JSON file
4. Data will be restored and app reloads

**Best Practices:**

• Backup weekly or after major entries
• Keep backups in multiple locations
• Test restore occasionally to ensure backups work
• Never share your backup file (contains financial data)
    `
  },
  {
    id: 'activity-log',
    title: 'Activity Log',
    titleHi: 'गतिविधि लॉग',
    titleNe: 'गतिविधि लग',
    icon: '🕐',
    content: `
**Tracking Your Activity**

The Activity Log records everything you do in the app.

**Accessing the Log:**

Tap the **clock icon** (🕐) in the top-left corner of the Home screen.

**What's Recorded:**

• Adding income or expenses
• Editing entries
• Deleting transactions
• Scheduling services
• Changing settings
• Backing up data
• And more...

**Each Activity Shows:**

• **Type** — What action was performed
• **Description** — Details of the action
• **Timestamp** — When it happened

**Why It's Useful:**

1. **Audit Trail** — See exactly what changed and when
2. **Error Recovery** — Identify accidental deletions
3. **Usage Patterns** — Understand your app habits
4. **Verification** — Confirm entries were saved

*The log keeps the last 100 activities.*
    `
  },
  {
    id: 'tips-tricks',
    title: 'Tips & Best Practices',
    titleHi: 'सुझाव और सर्वोत्तम अभ्यास',
    titleNe: 'सुझावहरू र उत्तम अभ्यासहरू',
    icon: '💡',
    content: `
**Getting the Most from Dakshina**

**Daily Habits**

• **Record immediately** — Add income right after receiving payment
• **Use consistent names** — Same spelling for repeat clients
• **Categorize properly** — Helps with accurate reports
• **Note special details** — Future you will thank present you

**Weekly Tasks**

• Review the week's entries for accuracy
• Check upcoming scheduled services
• Backup your data

**Monthly Review**

• Compare to previous months in Reports
• Review expense categories
• Check mileage totals
• Ensure all income is recorded

**Tax Season Prep**

• Verify your profile information is correct
• Review the full year in Tax Center
• Generate and save your tax report
• Export CSV for your accountant
• Gather receipts for major expenses

**Keyboard Shortcuts**

When entering amounts:
• Use decimal point for cents (e.g., 150.50)
• The app auto-formats currency

**Troubleshooting**

**App won't open?**
• Check if PIN is enabled
• Try force-closing and reopening

**Data missing?**
• Check Activity Log for deletions
• Restore from backup if needed

**Sync issues?**
• Data is stored locally on your device
• Use backup/restore to transfer between devices

**Need help?**
• Take a screenshot of the issue
• Note what you were doing when it occurred
    `
  }
]

export function HelpGuide({ isOpen, onClose, settings }) {
  const [activeSection, setActiveSection] = useState('getting-started')
  const lang = settings?.language || 'en'

  if (!isOpen) return null

  const currentSection = sections.find(s => s.id === activeSection)

  const getTitle = (section) => {
    if (lang === 'hi' && section.titleHi) return section.titleHi
    if (lang === 'ne' && section.titleNe) return section.titleNe
    return section.title
  }

  // Parse markdown-like content to JSX
  const renderContent = (content) => {
    const lines = content.trim().split('\n')
    const elements = []
    let listItems = []
    let inList = false

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="guide-list">
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: formatText(item) }} />
            ))}
          </ul>
        )
        listItems = []
      }
      inList = false
    }

    const formatText = (text) => {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      if (!trimmed) {
        flushList()
        return
      }

      // Headers
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
        flushList()
        elements.push(
          <h3 key={index} className="guide-heading">
            {trimmed.slice(2, -2)}
          </h3>
        )
        return
      }

      // Bullet points
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        inList = true
        listItems.push(trimmed.slice(1).trim())
        return
      }

      // Numbered lists
      if (/^\d+\./.test(trimmed)) {
        inList = true
        listItems.push(trimmed.replace(/^\d+\.\s*/, ''))
        return
      }

      // Regular paragraph
      flushList()
      elements.push(
        <p key={index} className="guide-paragraph" dangerouslySetInnerHTML={{ __html: formatText(trimmed) }} />
      )
    })

    flushList()
    return elements
  }

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="help-guide-modal">
        <div className="help-guide-header">
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2>{t('helpGuide', lang) || 'User Guide'}</h2>
          <div></div>
        </div>

        <div className="help-guide-layout">
          {/* Sidebar */}
          <nav className="help-guide-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="help-nav-icon">{section.icon}</span>
                <span className="help-nav-title">{getTitle(section)}</span>
                <ChevronRightIcon className="help-nav-arrow" />
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="help-guide-content">
            <div className="help-content-header">
              <span className="help-content-icon">{currentSection.icon}</span>
              <h2 className="help-content-title">{getTitle(currentSection)}</h2>
            </div>
            <div className="help-content-body">
              {renderContent(currentSection.content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

