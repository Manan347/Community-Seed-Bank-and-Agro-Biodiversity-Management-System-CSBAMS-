import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Quality({ role }) {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [seeds, setSeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ varietyId: '', germination: 85, purity: 98, moisture: 12, requestReview: false });
  const [submitting, setSubmitting] = useState(false);
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const isCoord = role === 'Coordinator';
  const isExpert = role === 'Agricultural Expert';

  const load = () => {
    setLoading(true);
    Promise.allSettled([api('/quality-tests'), ...(isCoord ? [api('/seeds')] : [])]).then(([tests, sds]) => {
      if (tests.status === 'fulfilled') setRows(tests.value);
      if (sds?.status === 'fulfilled') setSeeds(sds.value);
      setLoading(false);
    });
  };
  useEffect(load, [role]);

  const submit = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api('/quality-tests', { method: 'POST', body: { ...form, germination: +form.germination, purity: +form.purity, moisture: +form.moisture } });
      toast('Quality test recorded.'); setShowForm(false); load();
    } catch (x) { toast(x.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const review = async (test) => {
    const content = window.prompt('Enter your expert recommendation:');
    if (!content) return;
    try {
      await api(`/quality-tests/${test.test_id}/review`, { method: 'POST', body: { content } });
      toast('Review recorded.'); load();
    } catch (x) { toast(x.message, 'error'); }
  };

  const cols = [
    { key: 'test_id', label: 'Test ID' },
    { key: 'variety_id', label: 'Variety' },
    { key: 'germination', label: 'Germination %' },
    { key: 'purity', label: 'Purity %' },
    { key: 'moisture', label: 'Moisture %' },
    { key: 'status', label: 'Quality', render: r => <Badge status={r.status} /> },
    { key: 'review_status', label: 'Review', render: r => <Badge status={r.review_status} /> },
    { key: 'test_date', label: 'Date', render: r => r.test_date ? new Date(r.test_date).toLocaleDateString() : '—' },
    ...(isExpert ? [{
      key: '_act', label: 'Action',
      render: r => r.review_status === 'Requested'
        ? <button className="btn btn-sm btn-primary" onClick={() => review(r)}>Review</button>
        : null
    }] : []),
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>Quality Tests</h1><p className="text-muted">{isCoord ? 'Record germination, purity and moisture tests.' : 'Review quality tests and attach recommendations.'}</p></div>
        {isCoord && <div className="page-header__actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Record test</button></div>}
      </div>

      {showForm && (
        <Modal title="Record Quality Test" onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting} onClick={submit}>{submitting ? 'Saving…' : 'Save test'}</button>
          </>}>
          <form onSubmit={submit}>
            <FormGroup label="Seed variety">
              <select value={form.varietyId} onChange={e => f('varietyId', e.target.value)} required>
                <option value="">— choose —</option>
                {seeds.map(s => <option key={s.variety_id} value={s.variety_id}>{s.name}</option>)}
              </select>
            </FormGroup>
            <div className="form-row">
              <FormGroup label="Germination %" hint="Good ≥ 85, Average ≥ 70"><input type="number" min="0" max="100" step="0.1" value={form.germination} onChange={e => f('germination', e.target.value)} /></FormGroup>
              <FormGroup label="Purity %" hint="Good ≥ 98, Average ≥ 95"><input type="number" min="0" max="100" step="0.1" value={form.purity} onChange={e => f('purity', e.target.value)} /></FormGroup>
            </div>
            <div className="form-row">
              <FormGroup label="Moisture %" hint="Good ≤ 12, Average ≤ 14"><input type="number" min="0" max="100" step="0.1" value={form.moisture} onChange={e => f('moisture', e.target.value)} /></FormGroup>
              <FormGroup label=" " hint=" ">
                <label className="checkbox-label" style={{ marginTop: '8px' }}>
                  <input type="checkbox" checked={form.requestReview} onChange={e => f('requestReview', e.target.checked)} />
                  Flag for expert review
                </label>
              </FormGroup>
            </div>
          </form>
        </Modal>
      )}

      <DataTable columns={cols} rows={rows} loading={loading}
        emptyIcon="🔬" emptyTitle="No quality tests" emptyDesc="Record the first quality test." />
    </>
  );
}
