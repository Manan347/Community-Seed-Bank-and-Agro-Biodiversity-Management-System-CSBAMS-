import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Notifications() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api('/notifications').then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const markRead = async (n) => {
    try { await api(`/notifications/${n.notification_id}/read`, { method: 'PATCH', body: {} }); load(); }
    catch (x) { toast(x.message, 'error'); }
  };

  const unread = rows.filter(r => !r.is_read).length;

  const cols = [
    { key: 'title', label: 'Title' },
    { key: 'body', label: 'Message' },
    { key: 'type', label: 'Type', render: r => <span className="chip">{r.type}</span> },
    { key: 'is_read', label: 'Read', render: r => r.is_read ? <span style={{ color: 'var(--color-text-muted)' }}>Read</span> : <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Unread</span> },
    { key: 'created_at', label: 'Date', render: r => r.created_at ? new Date(r.created_at).toLocaleDateString() : '—' },
    { key: '_act', label: '', render: r => !r.is_read && <button className="btn btn-sm btn-secondary" onClick={() => markRead(r)}>Mark read</button> },
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>Notifications {unread > 0 && <span style={{ background: 'var(--color-danger)', color: '#fff', borderRadius: '999px', padding: '2px 10px', fontSize: '14px', fontWeight: 700, marginLeft: '8px' }}>{unread}</span>}</h1>
          <p className="text-muted">Your in-app notifications from loans, queries, and articles.</p>
        </div>
      </div>
      <DataTable columns={cols} rows={rows} loading={loading}
        emptyIcon="🔔" emptyTitle="No notifications" emptyDesc="You'll be notified on loan updates, query answers, and article publishing." />
    </>
  );
}
