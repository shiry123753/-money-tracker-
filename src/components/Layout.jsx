import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/', en: 'Home', zh: '首頁' },
  { to: '/debts', en: 'Debt', zh: '借貸' },
  { to: '/dashboard', en: 'Chart', zh: '分析' },
  { to: '/more', en: 'More', zh: '更多' },
]

export function BrushMark({ width = 72 }) {
  return (
    <svg className="brush" viewBox="0 0 168 44" width={width} fill="none"
      stroke="#6E665B" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 27 Q22 7 36 25 Q50 43 64 23 Q78 5 92 25 Q106 43 120 23 Q134 7 148 27" />
      <circle cx="156" cy="27" r="4.5" fill="#6E665B" stroke="none" />
    </svg>
  )
}

export default function Layout() {
  return (
    <div className="app">
      <header className="brand-header">
        <div>
          <BrushMark />
          <h1>LEDGER<span style={{ fontSize: 15, marginLeft: 8 }}>記帳本</span></h1>
        </div>
        <div className="sig">
          <span className="badge">L</span>
          <span className="capsule">2026</span>
        </div>
      </header>

      <Outlet />

      <div className="footer-sig">
        <span className="kicker">Personal Ledger · Since 2026</span>
        <span className="barcode" />
      </div>

      <nav className="tabbar">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="t-en">{t.en}</span>
              {t.zh}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
