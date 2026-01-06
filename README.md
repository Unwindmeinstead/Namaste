# Dakshina

**Income and expense tracker for spiritual service providers**

Dakshina is a beautiful, secure Progressive Web App (PWA) designed specifically for priests, pandits, gurujis, and spiritual service providers to track income, manage expenses, schedule services, and generate tax reports.

## Features

- 💰 **Income Tracking** - Record payments with payer names, categories, and payment methods
- 📉 **Expense Management** - Track business expenses and link them to specific jobs
- 🗓️ **Calendar & Scheduling** - Schedule future services and view past transactions
- 📊 **Reports & Analytics** - Visual breakdowns of income, expenses, and profitability
- 🏛️ **Tax Center** - Generate detailed tax reports and export data
- 🔒 **Security** - PIN lock protection for your financial data
- 🌍 **Multi-language** - English, Hindi, and Nepali support
- 📱 **PWA** - Install as an app on your device
- ☁️ **Backup & Restore** - Google Sheets, Drive, Email, and local backups

## Tech Stack

- React 19
- Vite
- PWA (Service Worker + Web App Manifest)
- Local Storage for data persistence

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## GitHub Pages Deployment

The app is automatically deployed to GitHub Pages via GitHub Actions when you push to the `main` branch.

### Manual Setup (if needed)

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will automatically deploy on every push to `main`

### Manual Deployment

```bash
npm run deploy
```

This will build the app and deploy it to the `gh-pages` branch.

## Live Site

The app is available at: `https://unwindmeinstead.github.io/guruji-income/`

## License

Private project
