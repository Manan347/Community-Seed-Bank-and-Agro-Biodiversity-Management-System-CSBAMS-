import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Returns() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ loanId: '', quantity: 1 });
  const [submitting, setSubmitting] = useState(false);
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const load = () => {
    setLoading(true);
    Promise.allSettled([api('/returns'), api('/loans')]).then(([ret, lns]) => {
      if (ret.status === 'fulfilled') setRows(ret.value);
      if (lns.status === 'fulfilled') setLoans(lns.value.filter(l => ['Issued', 'PartiallyReturned'].includes(l.status)));
      setLoading(false);
    });
  };
  useEffect(load, []);

  const submit = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api('/returns', { method: 'POST', body: { loanId: form.loanId, quantity: +form.quantity } });
      toast('Return recorded.'); setShowForm(false); load();
    } catch (x) { toast(x.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const cols = [
    { key: 'return_id', label: 'Return ID' },
    { key: 'loan_id', label: 'Loan ID' },
    { key: 'returned_quantity', label: 'Qty Returned' },
    { key: 'return_type', label: 'Type', render: r => <Badge status={r.return_type === 'Full' ? 'Returned' : 'PartiallyReturned'} /> },
    { key: 'return_date', label: 'Date', render: r => r.return_date ? new Date(r.return_date).toLocaleDateString() : '—' },
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>Returns</h1><p className="text-muted">Record seed returns against issued loans.</p></div>
        <div className="page-header__actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Record return</button></div>
      </div>

      {showForm && (
        <Modal title="Record Seed Return" onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting} onClick={submit}>{submitting ? 'Saving…' : 'Record'}</button>
          </>}>
          <form onSubmit={submit}>
            <FormGroup label="Issued loan">
              <select value={form.loanId} onChange={e => f('loanId', e.target.value)} required>
                <option value="">— choose loan —</option>
                {loans.map(l => <option key={l.loan_id} value={l.loan_id}>{l.loan_id} — {l.outstanding_quantity} kg outstanding</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Quantity to return (kg)">
              <input type="number" min="1" value={form.quantity} onChange={e => f('quantity', e.target.value)} required />
            </FormGroup>
          </form>
        </Modal>
      )}

      <DataTable columns={cols} rows={rows} loading={loading}
        emptyIcon="↩️" emptyTitle="No returns recorded" emptyDesc="Record a return when a farmer brings seed back." />
    </>
  );
}
