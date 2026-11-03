import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Stock() {
  const toast = useToast();
  const [inventory, setInventory] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [tab, setTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ varietyId: '', operation: 'add', quantity: 1, reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const loadAll = () => {
    setLoading(true);
    Promise.allSettled([api('/inventory'), api('/inventory/ledger')]).then(([inv, led]) => {
      if (inv.status === 'fulfilled') setInventory(inv.value);
      if (led.status === 'fulfilled') setLedger(led.value);
      setLoading(false);
    });
  };
  useEffect(loadAll, []);

  const submit = async e => {
    e.preventDefault();
    if (!form.varietyId) return toast('Select a variety first.', 'warning');
    setSubmitting(true);
    try {
      await api(`/inventory/${form.varietyId}/stock`, { method: 'POST', body: { ...form, quantity: +form.quantity } });
      toast(`Stock ${form.operation === 'add' ? 'added' : 'reduced'} successfully.`);
      setShowForm(false); loadAll();
    } catch (x) { toast(x.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const invCols = [
    { key: 'variety_id', label: 'ID' },
    { key: 'name', label: 'Variety' },
    { key: 'available_quantity', label: 'Available (kg)' },
    { key: 'low_stock_threshold', label: 'Threshold' },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    { key: 'updated_date', label: 'Updated', render: r => r.updated_date ? new Date(r.updated_date).toLocaleDateString() : '—' },
  ];

  const ledCols = [
    { key: 'ledger_id', label: 'ID' },
    { key: 'variety_id', label: 'Variety' },
    { key: 'delta', label: 'Change', render: r => <span style={{ color: r.delta > 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>{r.delta > 0 ? '+' : ''}{r.delta}</span> },
    { key: 'resulting_balance', label: 'Balance' },
    { key: 'reason', label: 'Reason' },
    { key: 'created_at', label: 'Date', render: r => r.created_at ? new Date(r.created_at).toLocaleString() : '—' },
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>Stock Manager</h1><p className="text-muted">Add or reduce stock, view the ledger.</p></div>
        <div className="page-header__actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Stock movement</button>
        </div>
      </div>

      {showForm && (
        <Modal title="Record Stock Movement" onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting} onClick={submit}>{submitting ? 'Saving…' : 'Save'}</button>
          </>}>
          <form onSubmit={submit}>
            <FormGroup label="Variety">
              <select value={form.varietyId} onChange={e => f('varietyId', e.target.value)}>
                <option value="">— select —</option>
                {inventory.map(v => <option key={v.variety_id} value={v.variety_id}>{v.name} ({v.available_quantity} kg)</option>)}
              </select>
            </FormGroup>
            <div className="form-row">
              <FormGroup label="Operation">
                <select value={form.operation} onChange={e => f('operation', e.target.value)}>
                  <option value="add">Add stock</option>
                  <option value="reduce">Reduce stock</option>
                </select>
              </FormGroup>
              <FormGroup label="Quantity (kg)"><input type="number" min="1" value={form.quantity} onChange={e => f('quantity', e.target.value)} /></FormGroup>
            </div>
            <FormGroup label="Reason"><input value={form.reason} onChange={e => f('reason', e.target.value)} placeholder="e.g. New harvest donation" required /></FormGroup>
          </form>
        </Modal>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}>Inventory</button>
        <button className={`tab ${tab === 'ledger' ? 'active' : ''}`} onClick={() => setTab('ledger')}>Stock Ledger</button>
      </div>

      {tab === 'inventory'
        ? <DataTable columns={invCols} rows={inventory} loading={loading} emptyIcon="📦" emptyTitle="No inventory" />
        : <DataTable columns={ledCols} rows={ledger} loading={loading} emptyIcon="📋" emptyTitle="No ledger entries" />}
    </>
  );
}
