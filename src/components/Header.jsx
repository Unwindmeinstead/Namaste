export function Header({ onMenuClick }) {
  return (
    <header className="header">
      <div className="header-left">
        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      </div>
      <h1 className="header-title">Income</h1>
      <div className="header-right">
        <button className="icon-btn" onClick={onMenuClick}>
          <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="19" cy="12" r="2"/>
          </svg>
        </button>
      </div>
    </header>
  )
}

