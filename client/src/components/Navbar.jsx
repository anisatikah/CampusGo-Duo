// client/src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-volt-500 to-plum-500 shadow-glow-volt">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-950" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h3l2-5h8l2 5h3" />
        <circle cx="7" cy="16" r="2" />
        <circle cx="17" cy="16" r="2" />
      </svg>
    </span>
    <span className="h-display text-lg leading-none">
      Duo<span className="text-volt-500">Pilot</span> <span className="text-ink-300 font-normal">Campus</span>
    </span>
  </Link>
);

const link = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive
      ? 'bg-white/5 text-ink-100'
      : 'text-ink-300 hover:text-ink-100 hover:bg-white/[0.03]'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = () => { logout(); nav('/login'); };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="container-app flex items-center justify-between h-16">
        <Logo />

        {user ? (
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/dashboard"     className={link}>Dashboard</NavLink>
            <NavLink to="/duopilot/book" className={link}>Ride</NavLink>
            <NavLink to="/storage/book"  className={link}>Storage</NavLink>
            <NavLink to="/orders"        className={link}>Orders</NavLink>
            {user.role === 'admin' && (
              <NavLink to="/admin" className={link}>Admin</NavLink>
            )}
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden md:inline text-xs text-ink-300">
                Hi, <span className="text-ink-100 font-medium">{user.name.split(' ')[0]}</span>
              </span>
              <button onClick={onLogout} className="btn-ghost text-sm py-2">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost text-sm py-2">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm py-2">Get started</Link>
            </>
          )}
        </div>
      </div>

      {/* mobile nav */}
      {user && (
        <nav className="sm:hidden border-t border-white/5 overflow-x-auto">
          <div className="container-app flex gap-1 py-2 text-sm">
            <NavLink to="/dashboard"     className={link}>Home</NavLink>
            <NavLink to="/duopilot/book" className={link}>Ride</NavLink>
            <NavLink to="/storage/book"  className={link}>Storage</NavLink>
            <NavLink to="/orders"        className={link}>Orders</NavLink>
            {user.role === 'admin' && <NavLink to="/admin" className={link}>Admin</NavLink>}
          </div>
        </nav>
      )}
    </header>
  );
}
