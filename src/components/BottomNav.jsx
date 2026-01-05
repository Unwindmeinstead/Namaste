import { HomeIcon, ChartIcon, TaxIcon, SettingsIcon } from './Icons'
import { t } from '../utils/translations'

export function BottomNav({ activePage, onPageChange, settings = {} }) {
  const lang = settings.language || 'en'
  
  const navItems = [
    { id: 'home', labelKey: 'home', Icon: HomeIcon },
    { id: 'reports', labelKey: 'reports', Icon: ChartIcon },
    { id: 'tax', labelKey: 'tax', Icon: TaxIcon },
    { id: 'settings', labelKey: 'settings', Icon: SettingsIcon }
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map(({ id, labelKey, Icon }) => (
        <button
          key={id}
          className={`nav-item ${activePage === id ? 'active' : ''}`}
          onClick={() => onPageChange(id)}
        >
          <Icon className="nav-icon" />
          <span>{t(labelKey, lang)}</span>
        </button>
      ))}
    </nav>
  )
}
