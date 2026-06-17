import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router'
import Inicio from './pages/Inicio.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import Detail from './pages/Detail.jsx'
import Login from './pages/Login.jsx'

const IconHome = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const IconChart = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const IconHistory = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1 0 .5-3.5"/><path d="M3 4v4h4"/>
  </svg>
)

const IconLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#ff1f78"/>
    <path d="M6 12h12M12 6v12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const IconLogout = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

function RequireAuth({ children }) {
  const authed = localStorage.getItem('lp_auth')
  return authed ? children : <Navigate to="/login" replace />
}

function AppShell() {
  const location = useLocation()
  const handleLogout = () => {
    localStorage.removeItem('lp_auth')
    window.location.href = '/login'
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <NavLink to="/" className="sidebar-logo">
          <IconLogo />
          Logs<span>Pay</span>
        </NavLink>

        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 500 }}>Saldo do Mês</span>
          </div>
          <div style={{ height: '3px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '0%', height: '100%', background: 'linear-gradient(to right, #ff1f78, #ff6eb0)', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <IconHome /> Início
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <IconChart /> Dashboard
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <IconHistory /> Histórico
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #ff1f78, #ff6eb0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>
              LP
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>LogsPay</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Administrador</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', borderRadius: '6px', transition: 'color 0.18s', display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="animate-in" key={location.pathname}>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/transaction/:id" element={<Detail />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<RequireAuth><AppShell /></RequireAuth>} />
    </Routes>
  )
}
