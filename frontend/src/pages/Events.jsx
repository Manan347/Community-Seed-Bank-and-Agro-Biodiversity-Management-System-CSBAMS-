import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Events({ role }) {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', eventDate: '', location: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const isAdmin = role === 'Administrator';
  const isFarmer = role === 'Farmer';
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const load = () => {
    setLoading(true);
    api('/events').then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api('/events', { method: 'POST', body: form });
      toast('Event created.'); setShowForm(false); load();
    } catch (x) { toast(x.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const join = async (ev) => {
    try { await api(`/events/${ev.event_id}/participate`, { method: 'POST', body: {} }); toast('Registered for event.'); }
    catch (x) { toast(x.message, 'error'); }
  };

  const del = async (ev) => {
    try { await api(`/events/${ev.event_id}`, { method: 'DELETE' }); toast('Event deleted.'); setConfirm(null); load(); }
    catch (x) { toast(x.message, 'error'); }
  };

  const cols = [
    { key: 'title', label: 'Event' },
    { key: 'location', label: 'Location' },
    { key: 'event_date', label: 'Date', render: r => r.event_date ? new Date(r.event_date).toLocaleDateString() : '—' },
    {
      key: '_act', label: 'Action',
      render: r => (
        <div className="table-actions">
          {isFarmer && <button className="btn btn-sm btn-secondary" onClick={() => join(r)}>Join</button>}
          {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => setConfirm(r)}>Delete</button>}
        </div>
      )
    }
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>Community Events</h1><p className="text-muted">View and manage seed bank events.</p></div>
        {isAdmin && <div className="page-header__actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create event</button></div>}
      </div>

      {showForm && (
        <Modal title="Create Event" onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting} onClick={submit}>{submitting ? 'Creating…' : 'Create'}</button>
          </>}>
          <form onSubmit={submit}>
            <FormGroup label="Event title"><input value={form.title} onChange={e => f('title', e.target.value)} required /></FormGroup>
            <div className="form-row">
              <FormGroup label="Date"><input type="date" value={form.eventDate} onChange={e => f('eventDate', e.target.value)} required /></FormGroup>
              <FormGroup label="Location"><input value={form.location} onChange={e => f('location', e.target.value)} required /></FormGroup>
            </div>
            <FormGroup label="Description"><textarea value={form.description} onChange={e => f('description', e.target.value)} rows={3} required /></FormGroup>
          </form>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog title="Delete Event" message={`Delete "${confirm.title}"? This cannot be undone.`} danger
          onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />
      )}

      <DataTable columns={cols} rows={rows} loading={loading}
        emptyIcon="📅" emptyTitle="No events" emptyDesc={isAdmin ? 'Create the first community event.' : 'No events scheduled.'} />
    </>
  );
}
