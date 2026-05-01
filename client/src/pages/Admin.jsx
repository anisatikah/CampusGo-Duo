// client/src/pages/Admin.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Admin() {
  const [tab, setTab] = useState('rides');
  const [rides, setRides] = useState([]);
  const [stors, setStors] = useState([]);
  const [crew,  setCrew]  = useState([]);
  const [config, setConfig] = useState({ zones: [], surcharges: [] });

  const refresh = () => {
    api.get('/duopilot/orders').then((r) => setRides(r.data.orders || []));
    api.get('/storage/orders').then((r) => setStors(r.data.orders || []));
    api.get('/duopilot/crew').then((r) => setCrew(r.data.crew || []));
    api.get('/duopilot/config').then((r) => setConfig(r.data));
  };
  useEffect(refresh, []);

  return (
    <div className="container-app py-10">
      <header className="mb-6 fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-400">Admin console</p>
          <h1 className="h-display text-4xl mt-1">Operations</h1>
        </div>
        <button onClick={refresh} className="btn-ghost text-sm">Refresh</button>
      </header>

      <div className="inline-flex flex-wrap p-1 rounded-xl bg-ink-800/60 border border-white/5 mb-5">
        {['rides', 'storage', 'pricing', 'crew'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === t ? 'bg-white/10 text-ink-100' : 'text-ink-300 hover:text-ink-100'
            }`}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'rides'   && <RideAdmin rides={rides} crew={crew} refresh={refresh} />}
      {tab === 'storage' && <StorageAdmin stors={stors} refresh={refresh} />}
      {tab === 'pricing' && <PricingAdmin config={config} refresh={refresh} />}
      {tab === 'crew'    && <CrewAdmin crew={crew} />}
    </div>
  );
}

/* ================= RIDE ADMIN ================= */
function RideAdmin({ rides, crew, refresh }) {
  const pilots   = crew.filter((c) => c.role === 'pilot' && c.is_active);
  const copilots = crew.filter((c) => c.role === 'copilot' && c.is_active);

  const setStatus = async (id, status) => {
    await api.patch(`/duopilot/status/${id}`, { status });
    refresh();
  };
  const assign = async (id, pilot_id, copilot_id) => {
    await api.patch(`/duopilot/assign/${id}`, { pilot_id, copilot_id });
    refresh();
  };

  return (
    <div className="space-y-3">
      {rides.length === 0 && <p className="text-sm text-ink-400">No rides.</p>}
      {rides.map((r) => (
        <div key={r.id} className="card fade-up">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-ink-400 font-mono">#{r.id}</span>
                <StatusBadge status={r.status} />
                {r.is_urgent && <span className="pill-amber">⚡</span>}
              </div>
              <p className="text-ink-100 mt-1">
                {r.pickup_location} <span className="text-volt-500">→</span> {r.dropoff_location}
              </p>
              <p className="text-[11px] text-ink-400">
                {new Date(r.datetime).toLocaleString('en-MY')} · by {r.user_name} ({r.user_email})
              </p>
            </div>
            <div className="h-display text-xl text-volt-500">RM {Number(r.total_price).toFixed(2)}</div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div>
              <label className="label">Pilot</label>
              <select className="input" value={r.pilot_id || ''}
                onChange={(e) => assign(r.id, e.target.value || null, r.copilot_id)}>
                <option value="">— unassigned —</option>
                {pilots.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Co-Pilot</label>
              <select className="input" value={r.copilot_id || ''}
                onChange={(e) => assign(r.id, r.pilot_id, e.target.value || null)}>
                <option value="">— unassigned —</option>
                {copilots.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={r.status}
                onChange={(e) => setStatus(r.id, e.target.value)}>
                {['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= STORAGE ADMIN ================= */
function StorageAdmin({ stors, refresh }) {
  const setStatus = async (id, status) => {
    await api.patch(`/storage/status/${id}`, { status });
    refresh();
  };
  return (
    <div className="space-y-3">
      {stors.length === 0 && <p className="text-sm text-ink-400">No storage orders.</p>}
      {stors.map((s) => (
        <div key={s.id} className="card fade-up">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-ink-400 font-mono">#{s.id}</span>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-ink-100 mt-1">
                {s.items.length} item{s.items.length > 1 ? 's' : ''} · {s.number_of_days} day{s.number_of_days > 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-ink-400">
                {new Date(s.start_date).toLocaleDateString('en-MY')} — {new Date(s.end_date).toLocaleDateString('en-MY')}
                {' · '} by {s.user_name}
              </p>
            </div>
            <div className="text-right">
              <div className="h-display text-xl text-plum-500">RM {Number(s.total_price).toFixed(2)}</div>
              <select className="input mt-2 max-w-[180px]" value={s.status}
                onChange={(e) => setStatus(s.id, e.target.value)}>
                {['pending', 'active', 'completed', 'cancelled'].map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= PRICING ADMIN ================= */
function PricingAdmin({ config, refresh }) {
  const toggle = async (type, is_active) => {
    await api.patch(`/duopilot/surcharges/${type}`, { is_active });
    refresh();
  };
  const setZone = async (name, base_price) => {
    await api.patch(`/duopilot/zones/${name}`, { base_price: Number(base_price) });
    refresh();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card fade-up">
        <h3 className="h-display text-xl mb-3">Zones</h3>
        <div className="space-y-2">
          {config.zones.map((z) => (
            <div key={z.name} className="flex items-center gap-3">
              <span className="pill-muted">Zone {z.name}</span>
              <span className="flex-1 text-sm text-ink-300 truncate">{z.label}</span>
              <span className="text-xs text-ink-400">RM</span>
              <input type="number" step="0.50" min="0" defaultValue={z.base_price}
                onBlur={(e) => setZone(z.name, e.target.value)}
                className="input w-24 text-right py-1.5" />
            </div>
          ))}
        </div>
      </div>

      <div className="card fade-up delay-1">
        <h3 className="h-display text-xl mb-3">Surcharges</h3>
        <div className="space-y-2">
          {config.surcharges.map((s) => (
            <label key={s.type} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={s.is_active}
                onChange={(e) => toggle(s.type, e.target.checked)}
                className="h-5 w-5 rounded bg-ink-800 border-white/10" />
              <span className="flex-1 text-sm text-ink-100">{s.label}</span>
              <span className="text-xs text-ink-300">+ RM {Number(s.amount).toFixed(2)}</span>
            </label>
          ))}
        </div>
        <p className="text-[11px] text-ink-400 mt-3">
          Toggling “rain” here lets you apply weather surcharge instantly.
        </p>
      </div>
    </div>
  );
}

/* ================= CREW ADMIN ================= */
function CrewAdmin({ crew }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {crew.map((c) => (
        <div key={c.id} className="card fade-up">
          <div className="flex justify-between">
            <div>
              <p className="text-ink-100 font-medium">{c.name}</p>
              <p className="text-[11px] text-ink-400">{c.phone}</p>
            </div>
            <span className={c.role === 'pilot' ? 'pill-volt' : 'pill-plum'}>{c.role}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
