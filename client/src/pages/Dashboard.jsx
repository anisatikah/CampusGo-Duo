// client/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [stors, setStors] = useState([]);
  const [params] = useSearchParams();

  useEffect(() => {
    api.get('/duopilot/orders').then((r) => setRides(r.data.orders || [])).catch(() => {});
    api.get('/storage/orders').then((r) => setStors(r.data.orders || [])).catch(() => {});
  }, []);

  const activeRides = rides.filter((r) => ['pending', 'accepted', 'in_progress'].includes(r.status));
  const activeStors = stors.filter((s) => ['pending', 'active'].includes(s.status));

  return (
    <div className="container-app py-10">
      {params.get('google') === 'connected' && (
        <div className="mb-6 card fade-up border-volt-500/30">
          <p className="text-sm text-volt-400 font-medium">✓ Google Calendar connected. New bookings will sync automatically.</p>
        </div>
      )}

      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="fade-up">
          <p className="text-xs uppercase tracking-widest text-ink-400">Dashboard</p>
          <h1 className="h-display text-4xl mt-1">
            Hello, <span className="text-volt-500">{user.name.split(' ')[0]}</span>.
          </h1>
        </div>
        <div className="flex gap-2 fade-up delay-1">
          <Link to="/duopilot/book" className="btn-primary">Book a ride</Link>
          <Link to="/storage/book"  className="btn-plum">Store stuff</Link>
        </div>
      </header>

      {/* Stats */}
      <section className="grid sm:grid-cols-4 gap-3 mb-10">
        <Stat tone="volt"  k={activeRides.length} label="Active rides" />
        <Stat tone="plum"  k={activeStors.length} label="Active storage" />
        <Stat tone="muted" k={rides.length}       label="Total rides" />
        <Stat tone="muted" k={stors.length}       label="Total storage" />
      </section>

      {/* Active lists */}
      <section className="grid lg:grid-cols-2 gap-6">
        <Panel title="Upcoming rides" empty="No active rides — book one!">
          {activeRides.slice(0, 4).map((r) => (
            <RideRow key={r.id} r={r} />
          ))}
        </Panel>

        <Panel title="Active storage" empty="No active storage right now.">
          {activeStors.slice(0, 4).map((s) => (
            <StorageRow key={s.id} s={s} />
          ))}
        </Panel>
      </section>
    </div>
  );
}

const Stat = ({ k, label, tone }) => {
  const tones = {
    volt:  'text-volt-500',
    plum:  'text-plum-500',
    muted: 'text-ink-100',
  };
  return (
    <div className="card fade-up">
      <div className={`h-display text-3xl ${tones[tone]}`}>{k}</div>
      <div className="text-[11px] uppercase tracking-wider text-ink-400 mt-1">{label}</div>
    </div>
  );
};

const Panel = ({ title, empty, children }) => {
  const arr = [].concat(children).filter(Boolean);
  return (
    <div className="card fade-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="h-display text-xl">{title}</h2>
        <Link to="/orders" className="text-xs text-volt-500 hover:text-volt-400 font-medium">
          View all →
        </Link>
      </div>
      {arr.length ? (
        <div className="space-y-3">{children}</div>
      ) : (
        <p className="text-sm text-ink-400 py-6 text-center">{empty}</p>
      )}
    </div>
  );
};

const RideRow = ({ r }) => (
  <div className="rounded-xl border border-white/5 bg-ink-800/50 p-3.5 flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-sm text-ink-100 truncate">
        <span className="text-ink-400">{r.pickup_location}</span>
        <span className="mx-2 text-volt-500">→</span>
        <span>{r.dropoff_location}</span>
      </p>
      <p className="text-[11px] text-ink-400 mt-1">
        {new Date(r.datetime).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
        {r.pilot_name && r.copilot_name && ` · ${r.pilot_name} + ${r.copilot_name}`}
      </p>
    </div>
    <div className="text-right shrink-0">
      <div className="h-display text-base text-volt-500">RM {Number(r.total_price).toFixed(2)}</div>
      <StatusBadge status={r.status} />
    </div>
  </div>
);

const StorageRow = ({ s }) => (
  <div className="rounded-xl border border-white/5 bg-ink-800/50 p-3.5 flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-sm text-ink-100 truncate">
        {s.items.length} item{s.items.length > 1 ? 's' : ''} · {s.number_of_days} day{s.number_of_days > 1 ? 's' : ''}
      </p>
      <p className="text-[11px] text-ink-400 mt-1">
        {new Date(s.start_date).toLocaleDateString('en-MY')} — {new Date(s.end_date).toLocaleDateString('en-MY')}
      </p>
    </div>
    <div className="text-right shrink-0">
      <div className="h-display text-base text-plum-500">RM {Number(s.total_price).toFixed(2)}</div>
      <StatusBadge status={s.status} />
    </div>
  </div>
);
