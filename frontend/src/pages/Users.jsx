import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Users() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    api('/users').then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggle = async (u) => {
    try {
      await api(`/users/${u.user_id}/status`, { method: 'PATCH', body: { status: u.status === 'Active' ? 'Inactive' : u.status === 'Registered' ? 'Active' : 'Active' } });
      toast('Account status updated.'); setConfirm(null); load();
    } catch (x) { toast(x.message, 'error'); }
  };

  const cols = [
    { key: 'user_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    { key: 'created_date', label: 'Registered', render: r => r.created_date ? new Date(r.created_date).toLocaleDateString() : '—' },
    {
      key: '_act', label: 'Action',
      render: r => (
        <button className={`btn btn-sm ${r.status === 'Active' ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setConfirm(r)}>
          {r.status === 'Active' ? 'Deactivate' : r.status === 'Registered' ? 'Activate' : 'Reactivate'}
        </button>
      )
    }
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>User Accounts</h1><p className="text-muted">Activate and manage all user accounts.</p></div>
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
          message={confirm.status === 'Active'
            ? `Deactivate ${confirm.name} (${confirm.role})? They will be unable to log in.`
            : `Activate ${confirm.name} (${confirm.role})?`}
          danger={confirm.status === 'Active'}
          onConfirm={() => toggle(confirm)} onCancel={() => setConfirm(null)} />
      )}

      <DataTable columns={cols} rows={rows} loading={loading}
        emptyIcon="👥" emptyTitle="No users" />
    </>
  );
}
