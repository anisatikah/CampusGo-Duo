// server/modules/duopilot/duopilot.service.js
const { query } = require('../../config/db');
const { computeDuoPilotTotal } = require('../../utils/pricing');
const gcal = require('../../utils/googleCalendar');

/**
 * Auto-pick one available pilot + one available copilot at random.
 * Falls back to NULL if none active — admin can assign later.
 */
async function pickCrew() {
  const { rows: pilots } = await query(
    `SELECT id FROM crew WHERE role = 'pilot' AND is_active = TRUE ORDER BY random() LIMIT 1`,
  );
  const { rows: copilots } = await query(
    `SELECT id FROM crew WHERE role = 'copilot' AND is_active = TRUE ORDER BY random() LIMIT 1`,
  );
  return {
    pilot_id: pilots[0]?.id || null,
    copilot_id: copilots[0]?.id || null,
  };
}

/**
 * Create a DuoPilot booking. Returns hydrated order row.
 */
async function createBooking({ user, body }) {
  const {
    pickup_location,
    dropoff_location,
    extra_stops = [],
    zone_from,
    zone_to,
    datetime,
    is_urgent = false,
    notes = null,
  } = body;

  if (!pickup_location || !dropoff_location || !zone_from || !zone_to || !datetime) {
    const err = new Error('pickup_location, dropoff_location, zones, and datetime are required');
    err.status = 400;
    throw err;
  }

  const is_multi_stop = Array.isArray(extra_stops) && extra_stops.length > 0;

  const pricing = await computeDuoPilotTotal({
    zone_from,
    zone_to,
    datetime,
    is_urgent,
    is_multi_stop,
  });

  const crew = await pickCrew();

  const { rows } = await query(
    `INSERT INTO duopilot_orders
      (user_id, pickup_location, dropoff_location, extra_stops,
       zone_from, zone_to, datetime, pilot_id, copilot_id,
       is_urgent, is_multi_stop, base_price, surcharge_total, total_price, status, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'pending',$15)
     RETURNING *`,
    [
      user.id, pickup_location, dropoff_location, JSON.stringify(extra_stops),
      zone_from, zone_to, datetime, crew.pilot_id, crew.copilot_id,
      is_urgent, is_multi_stop, pricing.base, pricing.surchargeTotal, pricing.total, notes,
    ],
  );
  const order = rows[0];

  // Optional: create calendar event with 30-min reminder
  try {
    const { rows: u } = await query('SELECT google_token FROM users WHERE id = $1', [user.id]);
    const token = u[0]?.google_token;
    if (token) {
      const start = new Date(datetime);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1h default
      const ev = await gcal.createEvent(token, {
        summary: `DuoPilot Ride · ${pickup_location} → ${dropoff_location}`,
        description: `2 Crew Onboard. Total: RM ${order.total_price}.`,
        start, end,
        remindersMinutes: [30],
      });
      if (ev?.id) {
        await query('UPDATE duopilot_orders SET calendar_event_id = $1 WHERE id = $2',
          [ev.id, order.id]);
        order.calendar_event_id = ev.id;
      }
    }
  } catch (_e) { /* non-fatal */ }

  return { order, pricing };
}

async function listOrders({ user }) {
  const params = [user.id];
  let where = 'o.user_id = $1';
  if (user.role === 'admin') { where = '1 = 1'; params.length = 0; }

  const sql = `
    SELECT o.*,
      p.name AS pilot_name,    p.phone AS pilot_phone,
      c.name AS copilot_name,  c.phone AS copilot_phone,
      u.name AS user_name,     u.email AS user_email
    FROM duopilot_orders o
    LEFT JOIN crew p ON p.id = o.pilot_id
    LEFT JOIN crew c ON c.id = o.copilot_id
    LEFT JOIN users u ON u.id = o.user_id
    WHERE ${where}
    ORDER BY o.created_at DESC
    LIMIT 200`;
  const { rows } = await query(sql, params);
  return rows;
}

async function updateStatus({ id, status, user }) {
  const allowed = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    const e = new Error('Invalid status'); e.status = 400; throw e;
  }
  // user can cancel own; admin can update any
  let sql, params;
  if (user.role === 'admin') {
    sql = `UPDATE duopilot_orders SET status = $1 WHERE id = $2 RETURNING *`;
    params = [status, id];
  } else {
    if (status !== 'cancelled') { const e = new Error('Forbidden'); e.status = 403; throw e; }
    sql = `UPDATE duopilot_orders SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *`;
    params = [status, id, user.id];
  }
  const { rows } = await query(sql, params);
  if (!rows[0]) { const e = new Error('Not found'); e.status = 404; throw e; }
  return rows[0];
}

async function assignCrew({ id, pilot_id, copilot_id }) {
  const { rows } = await query(
    `UPDATE duopilot_orders SET pilot_id = $1, copilot_id = $2 WHERE id = $3 RETURNING *`,
    [pilot_id || null, copilot_id || null, id],
  );
  if (!rows[0]) { const e = new Error('Not found'); e.status = 404; throw e; }
  return rows[0];
}

async function getZonesAndSurcharges() {
  const z = await query('SELECT name, label, base_price FROM zones ORDER BY name');
  const s = await query('SELECT type, label, amount, is_active FROM surcharges ORDER BY type');
  return { zones: z.rows, surcharges: s.rows };
}

async function getCrew() {
  const { rows } = await query(
    `SELECT id, name, phone, role, is_active FROM crew ORDER BY role, name`,
  );
  return rows;
}

async function toggleSurcharge({ type, is_active }) {
  const { rows } = await query(
    'UPDATE surcharges SET is_active = $1 WHERE type = $2 RETURNING *',
    [Boolean(is_active), type],
  );
  return rows[0];
}

async function updateZonePrice({ name, base_price }) {
  const { rows } = await query(
    'UPDATE zones SET base_price = $1 WHERE name = $2 RETURNING *',
    [base_price, name],
  );
  return rows[0];
}

module.exports = {
  createBooking,
  listOrders,
  updateStatus,
  assignCrew,
  getZonesAndSurcharges,
  getCrew,
  toggleSurcharge,
  updateZonePrice,
};
