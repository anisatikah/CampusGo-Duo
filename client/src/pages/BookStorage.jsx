// client/src/pages/BookStorage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function BookStorage() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [cart, setCart]   = useState({});  // { itemId: qty }
  const [start, setStart] = useState(today());
  const [end,   setEnd]   = useState(addDays(today(), 7));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState('');
  const [pickupAddon, setPickupAddon] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api.get('/storage/items').then((r) => setItems(r.data.items || [])).catch(() => {});
  }, []);

  const days = useMemo(() => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [start, end]);

  const cartLines = useMemo(() => {
    return Object.entries(cart)
      .filter(([, q]) => q > 0)
      .map(([id, qty]) => {
        const it = items.find((i) => i.id === Number(id));
        if (!it) return null;
        const lineTotal = round2(it.daily_price * days * qty);
        return { id: it.id, name: it.name, qty, daily_price: it.daily_price, line_total: lineTotal };
      })
      .filter(Boolean);
  }, [cart, items, days]);

  const subtotal = round2(cartLines.reduce((s, l) => s + l.line_total, 0));
  const total = Math.max(5, subtotal);

  const inc = (id) => setCart({ ...cart, [id]: (cart[id] || 0) + 1 });
  const dec = (id) => setCart({ ...cart, [id]: Math.max(0, (cart[id] || 0) - 1) });

  const submit = async (e) => {
    e.preventDefault();
    if (cartLines.length === 0) { setError('Add at least one item to your cart.'); return; }
    setSubmitting(true); setError('');
    try {
      const payload = {
        items: cartLines.map((l) => ({ item_id: l.id, qty: l.qty })),
        start_date: start,
        end_date: end,
      };
      const { data } = await api.post('/storage/book', payload);
      setSuccess({ order: data.order, lines: data.lines, total: data.total, days: data.days });
    } catch (e) {
      setError(e?.response?.data?.error || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  // ---- Upsell flow: book a pickup ride and link it ----
  const bookPickup = async () => {
    if (!success) return;
    try {
      const { data } = await api.post('/duopilot/book', {
        pickup_location: 'Customer address',
        dropoff_location: 'DuoPilot Storage HQ',
        zone_from: 'B',
        zone_to: 'A',
        datetime: success.order.start_date + 'T10:00',
        is_urgent: false,
        notes: `Pickup for storage order #${success.order.id}`,
      });
      await api.patch(`/storage/pickup/${success.order.id}`, { pickup_id: data.order.id });
      nav('/orders');
    } catch (e) {
      setError(e?.response?.data?.error || 'Pickup booking failed');
    }
  };

  // ---- Success screen ----
  if (success) {
    return (
      <div className="container-app py-10 max-w-2xl">
        <div className="card fade-up text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-plum-500/15 text-plum-400 text-xl">✓</div>
          <h1 className="h-display text-3xl mt-3">Storage booked.</h1>
          <p className="text-ink-300 text-sm mt-2">
            #{success.order.id} · {success.days} day{success.days > 1 ? 's' : ''} ·
            <span className="text-plum-400 font-semibold ml-1">RM {Number(success.total).toFixed(2)}</span>
          </p>
        </div>

        {!pickupAddon ? (
          <div className="mt-6 card fade-up delay-1 border-volt-500/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="h-display text-xl">Need a pickup?</h3>
                <p className="text-ink-300 text-sm mt-1">
                  Let our DuoPilot crew collect your items. Auto-scheduled for the start date.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={bookPickup} className="btn-primary">Yes, book pickup</button>
                <button onClick={() => { setPickupAddon(true); nav('/orders'); }}
                  className="btn-ghost">No thanks</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="container-app py-10 grid lg:grid-cols-3 gap-6">

      {/* CATALOGUE */}
      <section className="lg:col-span-2 space-y-6">
        <header className="fade-up">
          <p className="text-xs uppercase tracking-widest text-ink-400">Storage</p>
          <h1 className="h-display text-3xl">What do you want to store?</h1>
          <p className="text-ink-300 text-sm mt-1">Daily pricing. RM 5 minimum.</p>
        </header>

        <div className="card fade-up delay-1">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Start date</label>
              <input className="input" type="date" required
                value={start} min={today()} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className="label">End date</label>
              <input className="input" type="date" required
                value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-ink-400 mt-3">
            <span className="text-plum-400 font-medium">{days}</span> day{days > 1 ? 's' : ''} of storage.
          </p>
        </div>

        <div className="space-y-3 fade-up delay-2">
          {['luggage', 'storage_bag', 'individual'].map((cat) => (
            <Category key={cat} title={categoryLabel(cat)} items={items.filter((i) => i.category === cat)}
              cart={cart} inc={inc} dec={dec} days={days} />
          ))}
        </div>
      </section>

      {/* RECEIPT */}
      <aside className="card fade-up delay-3 lg:sticky lg:top-24 lg:self-start">
        <h3 className="h-display text-xl mb-1">Receipt</h3>
        <p className="text-xs text-ink-400 mb-4">{days} day{days > 1 ? 's' : ''} · {cartLines.length} line{cartLines.length === 1 ? '' : 's'}</p>

        {cartLines.length === 0 ? (
          <p className="text-sm text-ink-400 py-8 text-center">Add items to see your total.</p>
        ) : (
          <div className="space-y-2">
            {cartLines.map((l) => (
              <div key={l.id} className="flex items-start justify-between text-sm">
                <div className="min-w-0">
                  <p className="text-ink-100 truncate">{l.name}</p>
                  <p className="text-[11px] text-ink-400">
                    RM {l.daily_price.toFixed(2)} × {days} d × {l.qty}
                  </p>
                </div>
                <span className="text-ink-100 font-medium shrink-0">RM {l.line_total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="divider-soft my-3" />
        <Row k="Subtotal" v={`RM ${subtotal.toFixed(2)}`} />
        {total !== subtotal && (
          <Row k="Minimum charge" v={`RM ${(total - subtotal).toFixed(2)}`} muted />
        )}

        <div className="flex items-end justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-ink-300 text-sm">Total</span>
          <span className="h-display text-3xl text-plum-500">RM {total.toFixed(2)}</span>
        </div>

        {error && <p className="text-sm text-amber2-400 mt-3">{error}</p>}

        <button onClick={submit} disabled={submitting || cartLines.length === 0}
          className="btn-plum w-full mt-4">
          {submitting ? 'Booking…' : 'Confirm storage'}
        </button>

        <p className="text-[11px] text-ink-400 mt-3">
          Daily price = ROUND((base + 1) / 7, 2). Server re-validates on submit.
        </p>
      </aside>
    </div>
  );
}

const Category = ({ title, items, cart, inc, dec, days }) => (
  <div>
    <h3 className="text-xs uppercase tracking-wider text-ink-300 mb-2">{title}</h3>
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((it) => {
        const qty = cart[it.id] || 0;
        const lineTotal = round2(it.daily_price * days * (qty || 0));
        return (
          <div key={it.id}
            className={`rounded-xl border p-3.5 transition ${
              qty ? 'border-plum-500/40 bg-plum-500/5' : 'border-white/5 bg-ink-800/50'
            }`}>
            <div className="flex justify-between gap-2">
              <div className="min-w-0">
                <p className="text-ink-100 font-medium truncate">{it.name}</p>
                <p className="text-[11px] text-ink-400 mt-0.5">{it.description}</p>
                <p className="text-[11px] text-ink-300 mt-1">
                  RM {Number(it.daily_price).toFixed(2)} <span className="text-ink-400">/ day</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => dec(it.id)} className="btn-ghost h-7 w-7 p-0">−</button>
                  <span className="w-6 text-center text-ink-100 font-mono">{qty}</span>
                  <button onClick={() => inc(it.id)} className="btn-ghost h-7 w-7 p-0">+</button>
                </div>
                {qty > 0 && (
                  <span className="text-[11px] text-plum-400 font-medium">RM {lineTotal.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const Row = ({ k, v, muted }) => (
  <div className="flex items-center justify-between text-sm py-1">
    <span className={muted ? 'text-ink-400' : 'text-ink-300'}>{k}</span>
    <span className={muted ? 'text-ink-300' : 'text-ink-100 font-medium'}>{v}</span>
  </div>
);

const round2 = (n) => Math.round(n * 100) / 100;
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, n) => {
  const d = new Date(iso); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const categoryLabel = (c) => ({
  luggage: 'Luggage',
  storage_bag: 'Storage bags',
  individual: 'Individual items',
}[c] || c);
