// client/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [err,   setErr]   = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email, pass);
      const next = loc.state?.from || '/dashboard';
      nav(next, { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="container-app py-16 max-w-md">
      <div className="card fade-up">
        <h1 className="h-display text-3xl">Welcome back.</h1>
        <p className="text-ink-300 text-sm mt-2">Sign in to book a ride or check storage.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required
              value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>
          {err && <p className="text-sm text-amber2-400">{err}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-400 text-center">
          New here?{' '}
          <Link to="/register" className="text-volt-500 hover:text-volt-400 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
