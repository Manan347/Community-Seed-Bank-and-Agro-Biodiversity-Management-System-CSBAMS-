import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Articles({ role }) {
  const toast = useToast();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'seeds' });
  const [submitting, setSubmitting] = useState(false);
  const canCreate = ['Administrator', 'Agricultural Expert'].includes(role);
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const load = () => {
    setLoading(true);
    api('/articles').then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const create = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api('/articles', { method: 'POST', body: form });
      toast('Draft article created.'); setShowForm(false); load();
    } catch (x) { toast(x.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const submit = async (a) => {
    try { await api(`/articles/${a.article_id}/submit`, { method: 'POST', body: {} }); toast('Article submitted for review.'); load(); }
    catch (x) { toast(x.message, 'error'); }
  };

  const review = async (a, decision) => {
    const note = decision === 'revision' ? window.prompt('Explain the revision required:') || 'Please revise.' : 'Reviewed and published.';
    try { await api(`/articles/${a.article_id}/review`, { method: 'POST', body: { decision, note } }); toast(decision === 'approve' ? 'Article published.' : 'Revision requested.'); load(); }
    catch (x) { toast(x.message, 'error'); }
  };

  const CATEGORIES = ['seeds', 'traditional knowledge', 'pest control', 'soil', 'climate', 'general'];

  const cols = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category', render: r => <span className="chip">{r.category}</span> },
    { key: 'review_status', label: 'Status', render: r => <Badge status={r.review_status} /> },
    { key: 'created_date', label: 'Created', render: r => r.created_date ? new Date(r.created_date).toLocaleDateString() : '—' },
    {
      key: '_act', label: 'Actions',
      render: r => (
        <div className="table-actions">
          {r.author_id === user?.userId && ['Draft', 'NeedsRevision', 'Updated'].includes(r.review_status) && <button className="btn btn-sm btn-secondary" onClick={() => submit(r)}>Submit</button>}
          {role === 'Agricultural Expert' && r.review_status === 'UnderReview' && <>
            <button className="btn btn-sm btn-primary" onClick={() => review(r, 'approve')}>Publish</button>
            <button className="btn btn-sm btn-ghost" onClick={() => review(r, 'revision')}>Revise</button>
          </>}
        </div>
      )
    }
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>Knowledge Articles</h1><p className="text-muted">Browse and manage agricultural knowledge articles.</p></div>
        {canCreate && <div className="page-header__actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New article</button></div>}
      </div>

      {showForm && (
        <Modal title="Create Article" onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting} onClick={create}>{submitting ? 'Saving…' : 'Create draft'}</button>
          </>}>
          <form onSubmit={create}>
            <FormGroup label="Title"><input value={form.title} onChange={e => f('title', e.target.value)} required /></FormGroup>
            <FormGroup label="Category">
              <select value={form.category} onChange={e => f('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Content"><textarea value={form.content} onChange={e => f('content', e.target.value)} rows={8} required /></FormGroup>
          </form>
        </Modal>
      )}

      <DataTable columns={cols} rows={rows} loading={loading}
        emptyIcon="📚" emptyTitle="No articles" emptyDesc="No articles have been published yet." />
    </>
  );
}
