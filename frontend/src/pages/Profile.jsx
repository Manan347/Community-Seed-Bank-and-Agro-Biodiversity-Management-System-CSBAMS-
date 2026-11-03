import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { api, downloadCsv } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useToast } from '../context/ToastContext';
import { Loader, EmptyState, Badge, Modal, ConfirmDialog, DataTable, FormGroup, Alert } from '../components/common';

export default function Profile() {
  const toast = useToast();
  const [me, setMe] = useState(null);
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => { api('/users/me').then(setMe).catch(() => {}); }, []);

  const updateProfile = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api('/users/me', { method: 'PUT', body: { name: me.name, mobile: me.mobile } });
      toast('Profile updated.');
    } catch (x) { toast(x.message, 'error'); }
    finally { setSaving(false); }
  };

  const changePassword = async e => {
    e.preventDefault(); setChangingPwd(true);
    try {
      await api('/users/me/password', { method: 'PUT', body: pwd });
      toast('Password changed.'); setPwd({ currentPassword: '', newPassword: '' });
    } catch (x) { toast(x.message, 'error'); }
    finally { setChangingPwd(false); }
  };

  if (!me) return <Loader />;

  return (
    <>
      <div className="page-header"><div><h1>My Profile</h1><p className="text-muted">Manage your account details and password.</p></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--sp-6)' }}>
        <div className="card">
          <div className="card__header"><span className="card__title">Account details</span></div>
          <form onSubmit={updateProfile}>
            <FormGroup label="Full name"><input value={me.name} onChange={e => setMe({ ...me, name: e.target.value })} /></FormGroup>
            <FormGroup label="Mobile number"><input value={me.mobile} onChange={e => setMe({ ...me, mobile: e.target.value })} /></FormGroup>
            <FormGroup label="Role"><input value={me.role} disabled style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }} /></FormGroup>
            <FormGroup label="Status"><span style={{ display: 'inline-block', marginTop: '4px' }}><Badge status={me.status} /></span></FormGroup>
            <button className="btn btn-primary" disabled={saving} style={{ marginTop: 'var(--sp-2)' }}>{saving ? 'Saving…' : 'Save changes'}</button>
          </form>
        </div>
        <div className="card">
          <div className="card__header"><span className="card__title">Change password</span></div>
          <form onSubmit={changePassword}>
            <FormGroup label="Current password"><input type="password" value={pwd.currentPassword} onChange={e => setPwd({ ...pwd, currentPassword: e.target.value })} /></FormGroup>
            <FormGroup label="New password"><input type="password" value={pwd.newPassword} onChange={e => setPwd({ ...pwd, newPassword: e.target.value })} /></FormGroup>
            <button className="btn btn-secondary" disabled={changingPwd} style={{ marginTop: 'var(--sp-2)' }}>{changingPwd ? 'Changing…' : 'Change password'}</button>
          </form>
        </div>
      </div>
    </>
  );
}
