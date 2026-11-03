import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Loans({ role }) {
  const toast = useToast();
  const { online } = useOffline();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ varietyId: '', quantity: 1, purpose: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const load = () => {
    setLoading(true);
    api('/loans').then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (role === 'Farmer') api('/inventory').then(setInventory).catch(() => {});
  }, [role]);

  const submitLoan = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      const r = await api('/loans', { method: 'POST', body: { ...form, quantity: +form.quantity } });
      toast(r?.queued ? 'Loan request queued (offline).' : 'Loan request submitted successfully.');
      setShowForm(false); load();
    } catch (x) { toast(x.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const act = async (loan, action) => {
    try {
      const body = action === 'issue' ? { issuedQuantity: loan.requested_quantity } : action === 'reject' ? { reason: 'Rejected by coordinator.' } : {};
      await api(`/loans/${loan.loan_id}/${action}`, { method: 'PATCH', body });
      toast(`Loan ${action}d.`); load();
    } catch (x) { toast(x.message, 'error'); }
  };

  const cols = [
    { key: 'loan_id', label: 'Loan ID' },
    ...(role !== 'Farmer' ? [{ key: 'farmer_id', label: 'Farmer' }] : []),
    { key: 'variety_id', label: 'Variety' },
    { key: 'requested_quantity', label: 'Qty Requested' },
    { key: 'outstanding_quantity', label: 'Outstanding' },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    { key: 'request_date', label: 'Requested', render: r => r.request_date ? new Date(r.request_date).toLocaleDateString() : '—' },
    ...(role === 'Coordinator' ? [{
      key: '_actions', label: 'Actions',
      render: r => (
        <div className="table-actions">
          {r.status === 'Pending' && <><button className="btn btn-sm btn-primary" onClick={() => act(r, 'validate')}>Validate</button><button className="btn btn-sm btn-danger" onClick={() => setConfirm({ loan: r, action: 'reject' })}>Reject</button></>}
          {r.status === 'Validated' && <><button className="btn btn-sm btn-primary" onClick={() => act(r, 'approve')}>Approve</button><button className="btn btn-sm btn-danger" onClick={() => setConfirm({ loan: r, action: 'reject' })}>Reject</button></>}
          {r.status === 'Approved' && <button className="btn btn-sm btn-primary" onClick={() => setConfirm({ loan: r, action: 'issue' })}>Issue</button>}
        </div>
      )
    }] : []),
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>{role === 'Farmer' ? 'My Loans' : 'Loan Queue'}</h1><p className="text-muted">{role === 'Farmer' ? 'Request and track your seed loans.' : 'Validate, approve, and issue seed loans.'}</p></div>
        {role === 'Farmer' && <div className="page-header__actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Request loan</button></div>}
      </div>

      {!online && role === 'Farmer' && <Alert type="warning">⚡ You're offline. Loan requests will be queued and replayed when you reconnect.</Alert>}

      {showForm && (
        <Modal title="Request Seed Loan" onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting} onClick={submitLoan}>{submitting ? 'Submitting…' : 'Submit request'}</button>
          </>}>
          <form onSubmit={submitLoan}>
            <FormGroup label="Seed variety">
              <select value={form.varietyId} onChange={e => f('varietyId', e.target.value)} required>
                <option value="">— choose variety —</option>
                {inventory.map(v => <option key={v.variety_id} value={v.variety_id}>{v.name} — {v.available_quantity} kg available</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Quantity (kg)" hint="Must be ≤ available stock">
              <input type="number" min="1" value={form.quantity} onChange={e => f('quantity', e.target.value)} required />
            </FormGroup>
            <FormGroup label="Purpose (optional)">
              <input value={form.purpose} onChange={e => f('purpose', e.target.value)} placeholder="e.g. Monsoon sowing" />
            </FormGroup>
          </form>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.action === 'issue' ? 'Issue Loan' : 'Reject Loan'}
          message={confirm.action === 'issue'
            ? `Issue ${confirm.loan.requested_quantity} kg to farmer ${confirm.loan.farmer_id}? Inventory will be reduced.`
            : `Reject loan ${confirm.loan.loan_id}? This cannot be undone.`}
          danger={confirm.action === 'reject'}
          onConfirm={() => { act(confirm.loan, confirm.action); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <DataTable columns={cols} rows={rows} loading={loading}
        emptyIcon="📦" emptyTitle="No loans" emptyDesc={role === 'Farmer' ? 'Request a seed loan to get started.' : 'No loans in the queue.'} />
    </>
  );
}
