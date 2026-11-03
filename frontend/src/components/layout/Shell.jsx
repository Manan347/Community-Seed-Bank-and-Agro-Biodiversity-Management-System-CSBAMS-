import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { useToast } from '../../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../../components/common';
import { NAV } from './navConfig';
import Dashboard from '../../pages/Dashboard';
import Seeds from '../../pages/Seeds';
import Stock from '../../pages/Stock';
import Loans from '../../pages/Loans';
import Returns from '../../pages/Returns';
import Quality from '../../pages/Quality';
import Questions from '../../pages/Questions';
import Articles from '../../pages/Articles';
import Events from '../../pages/Events';
import Users from '../../pages/Users';
import Recommendations from '../../pages/Recommendations';
import Reports from '../../pages/Reports';
import Notifications from '../../pages/Notifications';
import Profile from '../../pages/Profile';


export default function Shell() {
  const { user, logout } = useAuth();
  const { online, pending } = useOffline();
  const [page, setPage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    api('/notifications').then(ns => setNotifCount(Array.isArray(ns) ? ns.filter(n => !n.is_read).length : 0)).catch(() => {});
  }, [page]);

  const navItems = NAV[user.role] || [];

  const renderPage = () => {
    switch (page) {
      case 'Dashboard':       return <Dashboard role={user.role} />;
      case 'Seeds':           return <Seeds role={user.role} />;
      case 'Stock':           return <Stock />;
      case 'Loans':           return <Loans role={user.role} />;
      case 'Returns':         return <Returns />;
      case 'Quality':         return <Quality role={user.role} />;
      case 'Questions':       return <Questions role={user.role} />;
      case 'Articles':        return <Articles role={user.role} />;
      case 'Events':          return <Events role={user.role} />;
      case 'Users':           return <Users />;
      case 'Recommendations': return <Recommendations role={user.role} />;
      case 'Reports':         return <Reports />;
      case 'Notifications':   return <Notifications />;
      case 'Profile':         return <Profile />;
      default:                return <Dashboard role={user.role} />;
    }
  };

  const navigate = (key) => { setPage(key); setSidebarOpen(false); };

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="shell">
      {/* Top Bar */}
      <header className="topbar">
        <button className="topbar__hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
          <span style={{ fontSize: '22px' }}>☰</span>
        </button>
        <div className="topbar__brand">🌱 CSBAMS</div>
        <div className="topbar__spacer" />
        <div className="topbar__info">
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: online ? '#4ade80' : '#f87171', display: 'inline-block' }} />
            {online ? 'Online' : 'Offline'}
            {pending > 0 && <span style={{ marginLeft: 4, background: 'rgba(255,165,0,.25)', padding: '1px 6px', borderRadius: '999px' }}>{pending} queued</span>}
          </div>
          <button className="notif-bell" onClick={() => navigate('Notifications')} title="Notifications">
            🔔 {notifCount > 0 && <span className="notif-dot" />}
          </button>
          <div className="topbar__user">
            <span className="topbar__name">{user.name}</span>
            <span className="topbar__role">{user.role}</span>
          </div>
          <div className="topbar__avatar">{initials}</div>
          <button className="topbar__logout" onClick={logout}>Sign out</button>
        </div>
      </header>

      {/* Offline banner */}
      {!online && (
        <div className="offline-banner">
          ⚡ You are offline. Some actions are unavailable. Loan requests are queued.
        </div>
      )}

      <div className="body-layout">
        {/* Sidebar overlay for mobile */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <span className="sidebar__section-label">Navigation</span>
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${page === item.key ? 'active' : ''}`}
              onClick={() => navigate(item.key)}
            >
              <span className="nav-item__icon">{item.icon}</span>
              {item.label}
              {item.key === 'Notifications' && notifCount > 0 && (
                <span className="nav-item__badge">{notifCount}</span>
              )}
            </button>
          ))}
          {user.role === 'Agricultural Expert' && (
            <button className={`nav-item ${page === 'Recommendations' ? 'active' : ''}`} onClick={() => navigate('Recommendations')}>
              <span className="nav-item__icon">💡</span>Recommendations
            </button>
          )}
        </nav>

        {/* Main */}
        <main className="main-content">{renderPage()}</main>
      </div>
    </div>
  );
}
