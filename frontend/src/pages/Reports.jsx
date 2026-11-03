import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Reports() {
  const toast = useToast();
  const [type, setType] = useState('inventory');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ variety: '', status: '', location: '', from: '', to: '' });
  const ff = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));

  const buildQuery = () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    return params.toString() ? '?' + params.toString() : '';
  };

  const load = () => {
    setLoading(true);
    api(`/reports/${type}${buildQuery()}`).then(d => setRows(d?.rows || [])).catch(() => setRows([])).finally(() => setLoading(false));
  };

  useEffect(load, [type]);

  const exportCsv = async () => {
    try {
      await downloadCsv(`/reports/${type}/export${buildQuery()}`, `${type}-report.csv`);
      toast('CSV download started.');
    } catch (x) { toast(x.message, 'error'); }
  };

  const colKeys = rows.length > 0 ? Object.keys(rows[0]) : [];
  const cols = colKeys.map(k => ({
    key: k,
    label: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    render: r => r[k] == null ? '—' : String(r[k]),
  }));

  return (
    <>
      <div className="page-header">
        <div><h1>Reports</h1><p className="text-muted">Generate and export reports with filters.</p></div>
        <div className="page-header__actions">
          <button className="btn btn-secondary" onClick={exportCsv}>⬇ Export CSV</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label>Report type</label>
          <select value={type} onChange={e => { setType(e.target.value); }}>
            <option value="inventory">Inventory</option>
            <option value="low-stock">Low Stock</option>
            <option value="loans">Loans</option>
            <option value="loan-return-summary">Loan & Return Summary</option>
            <option value="events">Events</option>
          </select>
        </div>
        <div className="form-group"><label>Variety</label><input placeholder="Filter by variety…" value={filters.variety} onChange={e => ff('variety', e.target.value)} /></div>
        <div className="form-group"><label>Status</label><input placeholder="Filter by status…" value={filters.status} onChange={e => ff('status', e.target.value)} /></div>
        <div className="form-group"><label>Location</label><input placeholder="Filter by location…" value={filters.location} onChange={e => ff('location', e.target.value)} /></div>
        <div className="form-group"><label>From date</label><input type="date" value={filters.from} onChange={e => ff('from', e.target.value)} /></div>
        <div className="form-group"><label>To date</label><input type="date" value={filters.to} onChange={e => ff('to', e.target.value)} /></div>
        <div className="form-group" style={{ justifyContent: 'flex-end' }}>
          <label>&nbsp;</label>
          <button className="btn btn-primary" onClick={load}>Apply filters</button>
        </div>
      </div>

      {loading ? <Loader /> : cols.length > 0
        ? <DataTable columns={cols} rows={rows} loading={false} emptyIcon="📊" emptyTitle="No results" emptyDesc="Adjust filters to see report data." />
        : <EmptyState icon="📊" title="No results" desc="Apply filters and run the report." />}
    </>
  );
}
