// client/src/pages/MyOrders.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge.jsx';

export default function MyOrders() {
  const [tab, setTab] = useState('rides');
  const [rides, setRides] = useState([]);
  const [stors, setStors] = useState([]);

  const refresh = () => {
    api.get('/duopilot/orders').then((r) => setRides(r.data.orders || [])).catch(() => {});
    api.get('/storage/orders').then((r) => setStors(r.data.orders || [])).catch(() => {});
  };
  useEffect(refresh, []);

  const cancelRide = async (id) => {
    if (!confirm('Cancel this ride?')) return;
    await api.patch(`/duopilot/status/${id}`, { status: 'cancelled' });
    refresh();
  };
  const cancelStorage = async (id) => {
    if (!confirm('Cancel this storage order?')) return;
    await api.patch(`/storage/status/${id}`, { status: 'cancelled' });
    refresh();
  };

  return (
    <div className="container-app py-10">
      <header className="mb-6 fade-up">
        <p className="text-xs uppercase tracking-widest text-ink-400">My orders</p>
        <h1 className="h-display text-4xl mt-1">History &amp; active</h1>
      </header>

      <div className="inline-flex p-1 rounded-xl bg-ink-800/60 border border-white/5 mb-5">
        <button onClick={() => setTab('rides')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'rides' ? 'bg-volt-500 text-ink-950' : 'text-ink-300 hover:text-ink-100'
          }`}>
          Rides ({rides.length})
        </button>
        <button onClick={() => setTab('storage')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'storage' ? 'bg-plum-500 text-white' : 'text-ink-300 hover:text-ink-100'
          }`}>
          Storage ({stors.length})
        </button>
      </div>

      {tab === 'rides' ? (
        <div className="space-y-3">
          {rides.length === 0 && <Empty msg="No rides yet." />}
          {rides.map((r) => <RideCard key={r.id} r={r} onCancel={cancelRide} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {stors.length === 0 && <Empty msg="No storage orders yet." />}
          {stors.map((s) => <StorageCard key={s.id} s={s} onCancel={cancelStorage} />)}
        </div>
      )}
    </div>
  );
}

const Empty = ({ msg }) => (
  <div className="card text-center py-10 text-sm text-ink-400">{msg}</div>
);

const RideCard = ({ r, onCancel }) => (
  <div className="card fade-up">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink-400 font-mono">#{r.id}</span>
          <StatusBadge status={r.status} />
          {r.is_urgent && <span className="pill-amber">⚡ Urgent</span>}
          {r.is_multi_stop && <span className="pill-muted">multi-stop</span>}
        </div>
        <p className="mt-2 text-ink-100 break-words">
          <span className="text-ink-400">{r.pickup_location}</span>
          <span className="mx-2 text-volt-500">→</span>
          {r.dropoff_location}
        </p>
        <p className="text-[11px] text-ink-400 mt-1">
          {new Date(r.datetime).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
          {' · '} Zone {r.zone_from} → {r.zone_to}
        </p>
        {r.pilot_name && r.copilot_name && (
          <p className="text-xs text-ink-300 mt-2">
            <span className="pill-volt mr-2">2 Crew Onboard</span>
            <span className="text-ink-100">{r.pilot_name}</span>
            <span className="text-ink-400"> ({r.pilot_phone})</span>
            <span className="mx-2 text-ink-500">+</span>
            <span className="text-ink-100">{r.copilot_name}</span>
            <span className="text-ink-400"> ({r.copilot_phone})</span>
          </p>
        )}
      </div>
      <div className="text-right">
        <div className="h-display text-2xl text-volt-500">RM {Number(r.total_price).toFixed(2)}</div>
        {['pending', 'accepted'].includes(r.status) && (
          <button onClick={() => onCancel(r.id)}
            className="text-xs text-amber2-400 hover:text-amber2-500 mt-2">
            Cancel
          </button>
        )}
      </div>
    </div>
  </div>
);

const StorageCard = ({ s, onCancel }) => (
  <div className="card fade-up">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink-400 font-mono">#{s.id}</span>
          <StatusBadge status={s.status} />
          {s.pickup_addon_id && <span className="pill-volt">pickup linked</span>}
        </div>
        <p className="mt-2 text-ink-100">
          {s.items.length} item{s.items.length > 1 ? 's' : ''} · {s.number_of_days} day{s.number_of_days > 1 ? 's' : ''}
        </p>
        <p className="text-[11px] text-ink-400 mt-1">
          {new Date(s.start_date).toLocaleDateString('en-MY')} — {new Date(s.end_date).toLocaleDateString('en-MY')}
        </p>
        <ul className="mt-2 text-xs text-ink-300 space-y-0.5">
          {s.items.map((it, i) => (
            <li key={i}>· {it.name} × {it.qty} — RM {Number(it.line_total).toFixed(2)}</li>
          ))}
        </ul>
      </div>
      <div className="text-right">
        <div className="h-display text-2xl text-plum-500">RM {Number(s.total_price).toFixed(2)}</div>
        {['pending', 'active'].includes(s.status) && (
          <button onClick={() => onCancel(s.id)}
            className="text-xs text-amber2-400 hover:text-amber2-500 mt-2">
            Cancel
          </button>
        )}
      </div>
    </div>
  </div>
);
