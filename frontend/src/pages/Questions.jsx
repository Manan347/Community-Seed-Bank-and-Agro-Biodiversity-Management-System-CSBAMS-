import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Questions({ role }) {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isFarmer = role === 'Farmer';
  const isExpert = role === 'Agricultural Expert';

  const load = () => {
    setLoading(true);
    api(isFarmer ? '/queries' : '/queries/open').then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(load, [role]);

  const submit = async e => {
    e.preventDefault();
    if (question.length < 10) return toast('Question must be at least 10 characters.', 'warning');
    setSubmitting(true);
    try {
      await api('/queries', { method: 'POST', body: { question } });
      toast('Question submitted.'); setShowForm(false); setQuestion(''); load();
    } catch (x) { toast(x.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const answer = async (q) => {
    const response = window.prompt('Enter your expert response:');
    if (!response) return;
    try {
      await api(`/queries/${q.query_id}/response`, { method: 'POST', body: { response } });
      toast('Response submitted.'); load();
    } catch (x) { toast(x.message, 'error'); }
  };

  const close = async (q) => {
    try {
      await api(`/queries/${q.query_id}/close`, { method: 'PATCH', body: {} });
      toast('Query closed.'); load();
    } catch (x) { toast(x.message, 'error'); }
  };

  const cols = [
    { key: 'query_id', label: 'ID' },
    { key: 'question', label: 'Question', render: r => <span title={r.question}>{r.question?.substring(0, 60)}{r.question?.length > 60 ? '…' : ''}</span> },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    { key: 'submitted_date', label: 'Submitted', render: r => r.submitted_date ? new Date(r.submitted_date).toLocaleDateString() : '—' },
    {
      key: '_act', label: 'Action',
      render: r => (
        <div className="table-actions">
          {isExpert && r.status === 'Open' && <button className="btn btn-sm btn-primary" onClick={() => answer(r)}>Respond</button>}
          {isFarmer && r.status === 'Answered' && <button className="btn btn-sm btn-secondary" onClick={() => close(r)}>Close</button>}
        </div>
      )
    }
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>{isFarmer ? 'My Questions' : 'Farmer Queries'}</h1><p className="text-muted">{isFarmer ? 'Ask agricultural questions and get expert answers.' : 'Answer open questions from farmers.'}</p></div>
        {isFarmer && <div className="page-header__actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Ask a question</button></div>}
      </div>

      {showForm && (
        <Modal title="Ask a Question" onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting} onClick={submit}>{submitting ? 'Submitting…' : 'Submit'}</button>
          </>}>
          <form onSubmit={submit}>
            <FormGroup label="Your question" hint="Minimum 10 characters">
              <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. What is the best time to plant Rajma in my region?" rows={4} />
            </FormGroup>
          </form>
        </Modal>
      )}

      <DataTable columns={cols} rows={rows} loading={loading}
        emptyIcon="❓" emptyTitle={isFarmer ? 'No questions yet' : 'No open queries'}
        emptyDesc={isFarmer ? 'Ask an agricultural expert a question.' : 'Farmers have no pending questions.'} />
    </>
  );
}
