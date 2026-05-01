// client/src/pages/BookDuoPilot.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ZERO = { base: 0, surcharges: [], total: 0 };

export default function BookDuoPilot() {
  const nav = useNavigate();
  const [config, setConfig] = useState({ zones: [], surcharges: [] });
  const [form, setForm] = useState({
    pickup_location: '',
    dropoff_location: '',
    extra_stops: [],
    zone_from: 'A',
    zone_to: 'A',
    datetime: defaultDateTime(),
    is_urgent: false,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/duopilot/config').then((r) => setConfig(r.data)).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ---- Live price preview (computed locally; backend re-computes on submit) ----
  const preview = useMemo(() => {
    if (!config.zones.length) return ZERO;
    const z = (n) => config.zones.find((x) => x.name === n);
    const base = Math.max(Number(z(form.zone_from)?.base_price || 0),
                          Number(z(form.zone_to)?.base_price || 0));
    const dt = new Date(form.datetime || Date.now());
    const isLateNight = dt.getHours() >= 23 || dt.getHours() < 5;
    const isMulti = form.extra_stops.length > 0;
    const out = [];
    const sc = Object.fromEntries(config.surcharges.map((s) => [s.type, s]));
    const push = (key) => sc[key]?.is_active && out.push({ type: key, label: sc[key].label, amount: Number(sc[key].amount) });
    if (isLateNight)    push('late_night');
    if (isMulti)        push('multi_stop');
    if (form.is_urgent) push('urgent');
    push('public_holiday');
    push('rain');
    const surchargeTotal = out.reduce((s, x) => s + x.amount, 0);
    return { base, surcharges: out, total: base + surchargeTotal };
  }, [config, form]);

  const addStop  = () => set('extra_stops', [...form.extra_stops, '']);
  const setStop  = (i, v) => {
    const s = [...form.extra_stops]; s[i] = v; set('extra_stops', s);
  };
  const dropStop = (i) => set('extra_stops', form.extra_stops.filter((_, j) => j !== i));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const payload = { ...form, extra_stops: form.extra_stops.filter(Boolean) };
      const { data } = await api.post('/duopilot/book', payload);
      nav('/orders', { state: { highlight: { type: 'ride', id: data.order.id } } });
    } catch (e) {
      setError(e?.response?.data?.error || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="container-app py-10 grid lg:grid-cols-3 gap-6">

      {/* FORM */}
      <form onSubmit={submit} className="lg:col-span-2 card fade-up space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-400">DuoPilot</p>
            <h1 className="h-display text-3xl">Book a ride or delivery</h1>
          </div>
          <span className="pill-volt">2 Crew Onboard</span>
        </header>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Pickup location</label>
            <input className="input" required placeholder="e.g. UNIMAS Cafeteria"
              value={form.pickup_location}
              onChange={(e) => set('pickup_location', e.target.value)} />
          </div>
          <div>
            <label className="label">Dropoff location</label>
            <input className="input" required placeholder="e.g. Desa Ilmu Block C"
              value={form.dropoff_location}
              onChange={(e) => set('dropoff_location', e.target.value)} />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Zone (from)</label>
            <select className="input" value={form.zone_from}
              onChange={(e) => set('zone_from', e.target.value)}>
              {config.zones.map((z) => (
                <option key={z.name} value={z.name}>Zone {z.name} · RM {Number(z.base_price).toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Zone (to)</label>
            <select className="input" value={form.zone_to}
              onChange={(e) => set('zone_to', e.target.value)}>
              {config.zones.map((z) => (
                <option key={z.name} value={z.name}>Zone {z.name} · RM {Number(z.base_price).toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date &amp; time</label>
            <input className="input" type="datetime-local" required
              value={form.datetime}
              onChange={(e) => set('datetime', e.target.value)} />
          </div>
        </div>

        {/* Extra stops */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label !mb-0">Extra stops (multi-stop)</label>
            <button type="button" onClick={addStop} className="text-xs text-volt-500 hover:text-volt-400 font-medium">
              + add stop
            </button>
          </div>
          {form.extra_stops.length === 0 ? (
            <p className="text-xs text-ink-400">No extra stops yet.</p>
          ) : (
            <div className="space-y-2">
              {form.extra_stops.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input" placeholder={`Stop #${i + 1}`}
                    value={s} onChange={(e) => setStop(i, e.target.value)} />
                  <button type="button" onClick={() => dropStop(i)}
                    className="btn-ghost px-3">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <label className={`pill cursor-pointer ${form.is_urgent ? 'pill-amber' : 'pill-muted'}`}>
            <input type="checkbox" className="hidden"
              checked={form.is_urgent}
              onChange={(e) => set('is_urgent', e.target.checked)} />
            ⚡ Urgent
          </label>
          <span className="text-xs text-ink-400">Adds urgent surcharge.</span>
        </div>

        <div>
          <label className="label">Notes (optional)</label>
          <textarea className="input min-h-[72px]" placeholder="Anything the crew should know?"
            value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>

        {error && <p className="text-sm text-amber2-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button className="btn-primary" disabled={submitting}>
            {submitting ? 'Booking…' : `Confirm · RM ${preview.total.toFixed(2)}`}
          </button>
          <button type="button" onClick={() => nav(-1)} className="btn-ghost">Cancel</button>
        </div>
      </form>

      {/* RECEIPT */}
      <aside className="card fade-up delay-2">
        <h3 className="h-display text-xl mb-1">Live receipt</h3>
        <p className="text-xs text-ink-400 mb-4">Re-computed by server on submit.</p>

        <Row k={`Base · Zone ${form.zone_from} → ${form.zone_to}`} v={`RM ${preview.base.toFixed(2)}`} />
        <div className="divider-soft my-3" />

        {preview.surcharges.length === 0 ? (
          <p className="text-xs text-ink-400">No surcharges applied.</p>
        ) : (
          preview.surcharges.map((s) => (
            <Row key={s.type} k={s.label} v={`+ RM ${s.amount.toFixed(2)}`} muted />
          ))
        )}

        <div className="divider-soft my-3" />
        <div className="flex items-end justify-between">
          <span className="text-ink-300 text-sm">Total</span>
          <span className="h-display text-3xl text-volt-500">RM {preview.total.toFixed(2)}</span>
        </div>

        <div className="mt-5 rounded-xl bg-volt-500/5 border border-volt-500/20 p-3 text-xs text-volt-400">
          ✓ Pilot &amp; co-pilot will be auto-assigned. You can see them in <em>My Orders</em> after booking.
        </div>
      </aside>
    </div>
  );
}

const Row = ({ k, v, muted }) => (
  <div className="flex items-center justify-between text-sm py-1">
    <span className={muted ? 'text-ink-400' : 'text-ink-300'}>{k}</span>
    <span className={muted ? 'text-ink-300' : 'text-ink-100 font-medium'}>{v}</span>
  </div>
);

function defaultDateTime() {
  const d = new Date(Date.now() + 30 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
