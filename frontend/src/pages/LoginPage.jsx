import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

const DEMO = [
  { role: 'Administrator', mobile: '9000000001', pass: 'Admin@123' },
  { role: 'Coordinator',   mobile: '9000000002', pass: 'Coord@123' },
  { role: 'Expert',        mobile: '9000000003', pass: 'Expert@123' },
  { role: 'Farmer',        mobile: '9000000004', pass: 'Farmer@123' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // login | register | otp
  const [form, setForm] = useState({ mobile: '9000000004', password: 'Farmer@123', name: '', role: 'Farmer' });
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleLogin = async e => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      const d = await api('/auth/login', { method: 'POST', body: { mobile: form.mobile, password: form.password } });
      if (d.otpRequired) {
        await api('/auth/otp/request', { method: 'POST', body: { mobile: form.mobile } });
        setTab('otp');
        setSuccess('OTP sent — check the backend console log.');
      } else { login(d.token, d.user); }
    } catch (x) { setError(x.message); }
    finally { setSubmitting(false); }
  };

  const handleOtp = async e => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      const d = await api('/auth/otp/verify', { method: 'POST', body: { mobile: form.mobile, code: otp } });
      login(d.token, d.user);
    } catch (x) { setError(x.message); }
    finally { setSubmitting(false); }
  };

  const handleRegister = async e => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      await api('/auth/register', { method: 'POST', body: form });
      setSuccess('Registration complete! An administrator must activate your account before you can log in.');
      setTab('login');
    } catch (x) { setError(x.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <div className="auth-card__logo-icon">🌱</div>
          <div className="auth-card__logo-text">
            <div className="auth-card__logo-name">CSBAMS</div>
            <div className="auth-card__logo-sub">Community Seed Bank System</div>
          </div>
        </div>

        {tab === 'otp' ? (
          <>
            <h2 className="auth-card__title">Enter OTP</h2>
            <p className="auth-card__desc">A 6-digit code was printed in the backend console for <strong>{form.mobile}</strong>.</p>
            {error && <Alert>{error}</Alert>}
            <form onSubmit={handleOtp}>
              <FormGroup label="One-Time Code">
                <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="123456" autoFocus />
              </FormGroup>
              <button className="btn btn-primary btn-lg w-full" disabled={submitting}>{submitting ? 'Verifying…' : 'Verify OTP'}</button>
            </form>
            <button className="btn btn-ghost w-full mt-2" onClick={() => { setTab('login'); setError(''); }}>← Back to login</button>
          </>
        ) : tab === 'register' ? (
          <>
            <h2 className="auth-card__title">Create account</h2>
            <p className="auth-card__desc">An administrator will activate your account before you can sign in.</p>
            {error && <Alert>{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            <form onSubmit={handleRegister}>
              <FormGroup label="Full name"><input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Your name" required /></FormGroup>
              <FormGroup label="Mobile number"><input value={form.mobile} onChange={e => f('mobile', e.target.value)} placeholder="10-digit mobile" maxLength={10} /></FormGroup>
              <FormGroup label="Role">
                <select value={form.role} onChange={e => f('role', e.target.value)}>
                  <option>Farmer</option>
                  <option>Coordinator</option>
                  <option>Agricultural Expert</option>
                  <option>Administrator</option>
                </select>
              </FormGroup>
              <FormGroup label="Password"><input type="password" value={form.password} onChange={e => f('password', e.target.value)} placeholder="Choose a password" required /></FormGroup>
              <button className="btn btn-primary btn-lg w-full" disabled={submitting}>{submitting ? 'Registering…' : 'Create account'}</button>
            </form>
            <div className="auth-divider">or</div>
            <button className="btn btn-ghost w-full" onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>Back to sign in</button>
          </>
        ) : (
          <>
            <h2 className="auth-card__title">Sign in</h2>
            <p className="auth-card__desc">Enter your mobile number and password.</p>
            {error && <Alert>{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            <form onSubmit={handleLogin}>
              <FormGroup label="Mobile number"><input value={form.mobile} onChange={e => f('mobile', e.target.value)} maxLength={10} /></FormGroup>
              <FormGroup label="Password"><input type="password" value={form.password} onChange={e => f('password', e.target.value)} /></FormGroup>
              <button className="btn btn-primary btn-lg w-full" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
            </form>
            <div className="auth-divider">or</div>
            <button className="btn btn-ghost w-full" onClick={() => { setTab('register'); setError(''); setSuccess(''); }}>Create an account</button>
            <div className="auth-demo-accounts">
              <strong>🔑 Demo accounts</strong>
              <table><thead><tr><th>Role</th><th>Mobile</th><th>Password</th></tr></thead>
                <tbody>{DEMO.map(d => (
                  <tr key={d.role} style={{ cursor: 'pointer' }} onClick={() => { f('mobile', d.mobile); f('password', d.pass); }}>
                    <td>{d.role}</td><td>{d.mobile}</td><td>{d.pass}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
