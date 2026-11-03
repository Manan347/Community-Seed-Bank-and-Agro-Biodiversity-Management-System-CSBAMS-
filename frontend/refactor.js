import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appPath = path.join(__dirname, 'src', 'App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const outDir = path.join(__dirname, 'src');

function write(relPath, content, imports = '') {
  const fullPath = path.join(outDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const finalContent = imports ? imports + '\n\n' + content : content;
  fs.writeFileSync(fullPath, finalContent.trim() + '\n');
}

const reactImports = "import { useEffect, useState, useCallback, createContext, useContext } from 'react';\nimport { api, downloadCsv } from '../api/client';\nimport { useAuth } from '../context/AuthContext';\nimport { useOffline } from '../context/OfflineContext';\nimport { useToast } from '../context/ToastContext';\nimport { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';";

const toastCtx = `import { createContext, useContext, useState, useCallback } from 'react';
const ToastCtx = createContext(null);
export function useToast() { return useContext(ToastCtx); }
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={\`toast \${t.type}\`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '!'}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}`;
write('context/ToastContext.jsx', toastCtx);

const commonComps = `import { useEffect } from 'react';

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
  return <span className={\`badge badge-\${status}\`}>{label}</span>;
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
        <button className={\`btn \${danger ? 'btn-danger' : 'btn-primary'}\`} onClick={onConfirm}>Confirm</button>
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
  return <div className={\`alert alert-\${type}\`}>{children}</div>;
}
`;
write('components/common/index.jsx', commonComps);

const parseFunction = (name, text) => {
  const regex = new RegExp("function " + name + "\\b[\\s\\S]*?^}", "m");
  const match = text.match(regex);
  return match ? 'export default ' + match[0] : null;
};

const pages = [
  'LoginPage', 'Dashboard', 'Seeds', 'Stock', 'Loans', 'Returns', 'Quality', 'Questions', 'Articles', 'Events', 'Users', 'Recommendations', 'Reports', 'Notifications', 'Profile'
];

pages.forEach(page => {
  const code = parseFunction(page, appContent);
  if (code) {
    let finalCode = code;
    if (page === 'LoginPage') {
      const demoRegex = /const DEMO = [\s\S]*?];/;
      const demoMatch = appContent.match(demoRegex);
      if (demoMatch) finalCode = demoMatch[0] + '\n\n' + code;
    }
    write('pages/' + page + '.jsx', finalCode, reactImports);
  } else {
    console.log('Missed ' + page);
  }
});

const navRegex = /const NAV = [\s\S]*?};/;
const navMatch = appContent.match(navRegex);
write('components/layout/navConfig.js', 'export ' + (navMatch ? navMatch[0] : 'const NAV = {};'));

const shellCode = parseFunction('Shell', appContent);
let shellImports = reactImports.replace("../components/common", "../../components/common");
shellImports = shellImports.replace("../api/client", "../../api/client");
shellImports = shellImports.replace("../context/AuthContext", "../../context/AuthContext");
shellImports = shellImports.replace("../context/OfflineContext", "../../context/OfflineContext");
shellImports = shellImports.replace("../context/ToastContext", "../../context/ToastContext");
shellImports += "\nimport { NAV } from './navConfig';\n";
pages.forEach(p => { if (p !== 'LoginPage') shellImports += "import " + p + " from '../../pages/" + p + "';\n"; });
if (shellCode) {
  write('components/layout/Shell.jsx', shellCode, shellImports);
} else {
  console.log('Missed Shell');
}

const newApp = `import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import Shell from './components/layout/Shell';
import './styles/index.css';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="auth-page">
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>CSBAMS</div>
          <div style={{ marginTop: 24 }}><div className="spinner" style={{ borderTopColor: '#fff', margin: '0 auto' }} /></div>
        </div>
      </div>
    );
  }
  return (
    <ToastProvider>
      {user ? <Shell /> : <LoginPage />}
    </ToastProvider>
  );
}`;
write('App.jsx', newApp);

console.log('Refactor complete!');
