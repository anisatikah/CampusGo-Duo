// client/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', campus: 'UNIMAS',
  });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await register(form);
      nav('/dashboard', { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container-app py-16 max-w-md">
      <div className="card fade-up">
        <h1 className="h-display text-3xl">Get started, lah.</h1>
        <p className="text-ink-300 text-sm mt-2">Free for UNIMAS &amp; UiTM students.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={set('name')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required
                value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+60 12-…"
                value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required minLength={6}
                value={form.password} onChange={set('password')} />
            </div>
            <div>
              <label className="label">Campus</label>
              <select className="input" value={form.campus} onChange={set('campus')}>
                <option value="UNIMAS">UNIMAS</option>
                <option value="UiTM">UiTM Samarahan</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          {err && <p className="text-sm text-amber2-400">{err}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-400 text-center">
          Already registered?{' '}
          <Link to="/login" className="text-volt-500 hover:text-volt-400 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
