import { useEffect } from 'react';

export function Loader() {
  return <div className="loader-wrap"><div className="spinner" /></div>;
}

export function EmptyState({ icon = '📭', title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div className="empty-state__title">{title}</div>
      {desc && <p className="empty-state__desc">{desc}</p>}
      {action}
    </div>
  );
}

export function Badge({ status }) {
  if (!status) return null;
  const label = status.replace(/([A-Z])/g, ' $1').trim();
  return <span className={`badge badge-${status}`}>{label}</span>;
}

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">{title}</span>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, danger }) {
  return (
    <Modal title={title} onClose={onCancel} footer={
      <>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>Confirm</button>
      </>
    }>
      <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}

export function DataTable({ columns, rows, loading, emptyIcon, emptyTitle, emptyDesc }) {
  if (loading) return <Loader />;
  if (!rows?.length) return <EmptyState icon={emptyIcon || '📋'} title={emptyTitle || 'No records'} desc={emptyDesc} />;
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map(c => (
                <td key={c.key}>
                  {c.render ? c.render(row) : (row[c.key] == null ? '—' : String(row[c.key]))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FormGroup({ label, hint, error, children }) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      {hint && <span className="form-hint">{hint}</span>}
      {children}
      {error && <span className="form-error">⚠ {error}</span>}
    </div>
  );
}

export function Alert({ type = 'error', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}
