import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Seeds({ role }) {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', source: '', storageLocation: '', initialQuantity: 10, lowStockThreshold: 5 });
  const [submitting, setSubmitting] = useState(false);
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const load = () => {
    setLoading(true);
    api(role === 'Coordinator' ? '/seeds' : '/inventory')
      .then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(load, [role]);

  const submit = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api('/seeds', { method: 'POST', body: { ...form, initialQuantity: +form.initialQuantity, lowStockThreshold: +form.lowStockThreshold } });
      toast('Seed variety registered.');
      setShowForm(false); setForm({ name: '', source: '', storageLocation: '', initialQuantity: 10, lowStockThreshold: 5 });
      load();
    } catch (x) { toast(x.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const isCoord = role === 'Coordinator';
  const cols = isCoord
    ? [
        { key: 'variety_id', label: 'ID' },
        { key: 'name', label: 'Variety' },
        { key: 'source', label: 'Source' },
        { key: 'storage_location', label: 'Location' },
      ]
    : [
        { key: 'name', label: 'Variety', render: r => r.name || r.variety_id },
        { key: 'available_quantity', label: 'Available (kg)' },
        { key: 'low_stock_threshold', label: 'Threshold' },
        { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
      ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{isCoord ? 'Seed Varieties' : 'Seed Catalog'}</h1>
          <p className="text-muted">{isCoord ? 'Register and manage seed varieties.' : 'Browse available seed varieties.'}</p>
        </div>
        {isCoord && (
          <div className="page-header__actions">
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Register variety</button>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Register Seed Variety" onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting} onClick={submit}>{submitting ? 'Saving…' : 'Register'}</button>
          </>}>
          <form onSubmit={submit}>
            <div className="form-row">
              <FormGroup label="Variety name"><input value={form.name} onChange={e => f('name', e.target.value)} required /></FormGroup>
              <FormGroup label="Source"><input value={form.source} onChange={e => f('source', e.target.value)} required /></FormGroup>
            </div>
            <FormGroup label="Storage location"><input value={form.storageLocation} onChange={e => f('storageLocation', e.target.value)} required /></FormGroup>
            <div className="form-row">
              <FormGroup label="Initial quantity (kg)" hint="Integer units"><input type="number" min="0" value={form.initialQuantity} onChange={e => f('initialQuantity', e.target.value)} /></FormGroup>
              <FormGroup label="Low-stock threshold" hint="Alert below this"><input type="number" min="1" value={form.lowStockThreshold} onChange={e => f('lowStockThreshold', e.target.value)} /></FormGroup>
            </div>
          </form>
        </Modal>
      )}

      <DataTable columns={cols} rows={rows} loading={loading}
        emptyIcon="🌾" emptyTitle="No varieties yet"
        emptyDesc={isCoord ? 'Register the first seed variety to get started.' : 'No varieties are available.'} />
    </>
  );
}
