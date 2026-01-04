import { HomeIcon, ChartIcon, TaxIcon, SettingsIcon } from './Icons'

const navItems = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'reports', label: 'Reports', Icon: ChartIcon },
  { id: 'tax', label: 'Tax', Icon: TaxIcon },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon }
]

export function BottomNav({ activePage, onPageChange }) {
  return (
    <nav className="bottom-nav">
      {navItems.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-item ${activePage === id ? 'active' : ''}`}
          onClick={() => onPageChange(id)}
        >
          <Icon className="nav-icon" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
