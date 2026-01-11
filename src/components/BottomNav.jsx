import { HomeIcon, ChartIcon, TaxIcon, SettingsIcon } from './Icons'
import { t } from '../utils/translations'
import { haptic } from '../utils/haptic'

export function BottomNav({ activePage, onPageChange, settings = {} }) {
  const lang = settings.language || 'en'
  
  const navItems = [
    { id: 'home', labelKey: 'home', Icon: HomeIcon },
    { id: 'reports', labelKey: 'reports', Icon: ChartIcon },
    { id: 'tax', labelKey: 'tax', Icon: TaxIcon },
    { id: 'settings', labelKey: 'settings', Icon: SettingsIcon }
  ]

  const handleNavClick = (id) => {
    if (id !== activePage) haptic()
    onPageChange(id)
  }

  return (
    <nav className="bottom-nav">
      {navItems.map(({ id, labelKey, Icon }) => (
        <button
          key={id}
          className={`nav-item ${activePage === id ? 'active' : ''}`}
          onClick={() => handleNavClick(id)}
        >
          <Icon className="nav-icon" />
          <span>{t(labelKey, lang)}</span>
        </button>
      ))}
    </nav>
  )
}
