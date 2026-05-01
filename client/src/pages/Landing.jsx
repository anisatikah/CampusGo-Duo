// client/src/pages/Landing.jsx
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="container-app pt-12 sm:pt-20 pb-20">

      {/* HERO */}
      <section className="relative">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7 fade-up">
            <span className="pill-volt mb-5">UNIMAS · UiTM Samarahan</span>
            <h1 className="h-display text-4xl sm:text-6xl lg:text-7xl leading-[0.95]">
              Two crew onboard.
              <br />
              <span className="text-volt-500">One tap</span> to ride or store.
            </h1>
            <p className="mt-6 text-ink-300 text-lg max-w-xl leading-relaxed">
              DuoPilot Campus pairs every booking with a <em className="text-ink-100 not-italic">pilot &amp; co-pilot</em>
              {' '}for safer hyperlocal rides &amp; deliveries — plus daily storage so your luggage
              never sleeps in the hostel corridor again.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary">Create student account →</Link>
              <Link to="/login"    className="btn-ghost">I already have one</Link>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-4 max-w-md">
              {[
                ['RM 4', 'on-campus rides'],
                ['RM 0.71', 'cheapest day storage'],
                ['2', 'crew per trip'],
              ].map(([k, v]) => (
                <div key={v} className="card-pad p-4">
                  <div className="h-display text-2xl text-ink-100">{k}</div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-400 mt-1">{v}</div>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5 fade-up delay-2">
            <div className="card relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="pill-volt">2 Crew Onboard</span>
                  <span className="text-[11px] uppercase tracking-wider text-ink-400">Live preview</span>
                </div>
                <div className="mt-5 space-y-3">
                  <Row k="Pickup"  v="UNIMAS Cafeteria" />
                  <Row k="Dropoff" v="Desa Ilmu Block C" />
                  <Row k="Crew"    v="Aiman + Aina" />
                  <div className="divider-soft my-4" />
                  <Row k="Zone A→B" v="RM 7.00" />
                  <Row k="Late night" v="RM 3.00" />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-ink-300 text-sm">Total</span>
                    <span className="h-display text-3xl text-volt-500">RM 10.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="mt-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Feat title="Duo Pilot Rides" tone="volt"
          desc="Pickup, drop-off, multi-stop. Every booking ships with a pilot AND a co-pilot for accountability." />
        <Feat title="Daily Storage" tone="plum"
          desc="Daily pricing — luggage, bags, boxes. Pay only for the days you store. RM 5 minimum." />
        <Feat title="Calendar Sync" tone="volt"
          desc="Auto-creates Google Calendar events with smart reminders so you never miss a pickup or end-date." />
      </section>
    </div>
  );
}

const Row = ({ k, v }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-ink-300">{k}</span>
    <span className="text-ink-100 font-medium">{v}</span>
  </div>
);

const Feat = ({ title, desc, tone }) => {
  const accent = tone === 'plum'
    ? 'from-plum-500/20 to-transparent'
    : 'from-volt-500/15 to-transparent';
  const dot = tone === 'plum' ? 'bg-plum-500' : 'bg-volt-500';
  return (
    <div className="card relative overflow-hidden fade-up">
      <div className={`absolute -top-20 -right-20 h-44 w-44 rounded-full bg-gradient-to-br ${accent} blur-2xl`} />
      <div className="relative">
        <span className={`inline-block h-2 w-2 rounded-full ${dot} mb-4`} />
        <h3 className="h-display text-xl">{title}</h3>
        <p className="text-ink-300 text-sm mt-2 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};
