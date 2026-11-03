import { useAuth } from './context/AuthContext';
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
}
