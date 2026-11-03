import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Dashboard({ role }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const defs = {
      Farmer: [
        { label: 'Seed varieties', icon: '🌾', path: '/inventory' },
        { label: 'My loans', icon: '📦', path: '/loans' },
        { label: 'Notifications', icon: '🔔', path: '/notifications' },
        { label: 'Events', icon: '📅', path: '/events' },
      ],
      Coordinator: [
        { label: 'Varieties', icon: '🌾', path: '/seeds' },
        { label: 'Active loans', icon: '📦', path: '/loans' },
        { label: 'Returns', icon: '↩️', path: '/returns' },
        { label: 'Notifications', icon: '🔔', path: '/notifications' },
      ],
      'Agricultural Expert': [
        { label: 'Quality tests', icon: '🔬', path: '/quality-tests' },
        { label: 'Open queries', icon: '❓', path: '/queries/open' },
        { label: 'Recommendations', icon: '💡', path: '/recommendations' },
        { label: 'Notifications', icon: '🔔', path: '/notifications' },
      ],
      Administrator: [
        { label: 'Total users', icon: '👥', path: '/users' },
        { label: 'Events', icon: '📅', path: '/events' },
        { label: 'Articles', icon: '📚', path: '/articles' },
        { label: 'Notifications', icon: '🔔', path: '/notifications' },
      ],
    }[role] || [];

    Promise.allSettled(defs.map(d => api(d.path))).then(results => {
      setStats(defs.map((d, i) => ({
        ...d,
        value: results[i].status === 'fulfilled' && Array.isArray(results[i].value)
          ? results[i].value.length : '—',
      })));
      setLoading(false);
    });
  }, [role]);

  const greetings = {
    Farmer: 'Manage your seed loans, check availability, and explore knowledge.',
    Coordinator: 'Review loans, manage stock, and record quality tests.',
    'Agricultural Expert': 'Review quality tests, answer farmer queries, and publish guidance.',
    Administrator: 'Manage accounts, events, articles, and reports.',
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{role} Dashboard</h1>
          <p className="text-muted">{greetings[role]}</p>
        </div>
      </div>
      {loading ? <Loader /> : (
        <div className="stats-grid">
          {stats.map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-card__icon">{s.icon}</div>
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
