import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Recommendations({ role }) {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ varietyId: '', type: 'Seed Variety Recommendation', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const isExpert = role === 'Agricultural Expert';
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const load = () => {
    setLoading(true);
    api('/recommendations').then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api('/recommendations', { method: 'POST', body: form });
      toast('Recommendation published.'); setShowForm(false); load();
    } catch (x) { toast(x.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const cols = [
    { key: 'recommendation_id', label: 'ID' },
    { key: 'type', label: 'Type' },
    { key: 'content', label: 'Content', render: r => <span title={r.content}>{r.content?.substring(0, 80)}{r.content?.length > 80 ? '…' : ''}</span> },
    { key: 'recommendation_date', label: 'Date', render: r => r.recommendation_date ? new Date(r.recommendation_date).toLocaleDateString() : '—' },
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>Expert Recommendations</h1><p className="text-muted">Guidance on seed varieties, traditional farming, and agro-biodiversity.</p></div>
        {isExpert && <div className="page-header__actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New recommendation</button></div>}
      </div>

      {showForm && (
        <Modal title="New Recommendation" onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting} onClick={submit}>{submitting ? 'Publishing…' : 'Publish'}</button>
          </>}>
          <form onSubmit={submit}>
            <FormGroup label="Variety ID"><input value={form.varietyId} onChange={e => f('varietyId', e.target.value)} placeholder="e.g. VAR-RAJMA" /></FormGroup>
            <FormGroup label="Type">
              <select value={form.type} onChange={e => f('type', e.target.value)}>
                <option>Seed Variety Recommendation</option>
                <option>Traditional Farming Guidance</option>
                <option>Agro-Biodiversity Recommendation</option>
              </select>
            </FormGroup>
            <FormGroup label="Content"><textarea value={form.content} onChange={e => f('content', e.target.value)} rows={5} required /></FormGroup>
          </form>
        </Modal>
      )}

      <DataTable columns={cols} rows={rows} loading={loading}
        emptyIcon="💡" emptyTitle="No recommendations" emptyDesc="Expert recommendations will appear here." />
    </>
  );
}
