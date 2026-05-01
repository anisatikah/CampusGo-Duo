// server/modules/storage/storage.service.js
const { query } = require('../../config/db');
const { computeStorageTotal, dailyFromBase } = require('../../utils/pricing');
const gcal = require('../../utils/googleCalendar');

async function listItems() {
  const { rows } = await query(
    `SELECT id, name, category, base_price, description
       FROM storage_items WHERE is_active = TRUE ORDER BY category, base_price`,
  );
  return rows.map((r) => ({
    ...r,
    base_price: Number(r.base_price),
    daily_price: dailyFromBase(r.base_price),
  }));
}

/**
 * Live quote without persisting.
 */
async function quote({ items, start_date, end_date }) {
  return computeStorageTotal(items, start_date, end_date);
}

async function createBooking({ user, body }) {
  const { items, start_date, end_date } = body;
  if (!start_date || !end_date) {
    const e = new Error('start_date and end_date required'); e.status = 400; throw e;
  }
  if (new Date(end_date) < new Date(start_date)) {
    const e = new Error('end_date must be on or after start_date'); e.status = 400; throw e;
  }
  const { lines, days, subtotal, total } =
    await computeStorageTotal(items, start_date, end_date);

  const { rows } = await query(
    `INSERT INTO storage_orders
      (user_id, items, start_date, end_date, number_of_days, subtotal, total_price, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
     RETURNING *`,
    [user.id, JSON.stringify(lines), start_date, end_date, days, subtotal, total],
  );
  const order = rows[0];

  // Calendar events: start (info) and end (with multiple reminders).
  try {
    const u = await query('SELECT google_token FROM users WHERE id = $1', [user.id]);
    const tok = u.rows[0]?.google_token;
    if (tok) {
      const startEv = await gcal.createEvent(tok, {
        summary: `Storage start — DuoPilot Campus`,
        description: `${lines.length} item(s) checked in. Total RM ${total}.`,
        start: new Date(start_date),
        end: new Date(new Date(start_date).getTime() + 30 * 60 * 1000),
        remindersMinutes: [60],
      });
      const endEv = await gcal.createEvent(tok, {
        summary: `Storage end — collect items`,
        description: `Pick up your ${lines.length} item(s).`,
        start: new Date(end_date),
        end: new Date(new Date(end_date).getTime() + 30 * 60 * 1000),
        remindersMinutes: [3 * 24 * 60, 24 * 60], // 3 days + 1 day before
      });
      await query(
        'UPDATE storage_orders SET calendar_start_id = $1, calendar_end_id = $2 WHERE id = $3',
        [startEv?.id || null, endEv?.id || null, order.id],
      );
      order.calendar_start_id = startEv?.id || null;
      order.calendar_end_id = endEv?.id || null;
    }
  } catch (_e) { /* non-fatal */ }

  return { order, lines, days, subtotal, total };
}

async function listOrders({ user }) {
  const params = [user.id];
  let where = 'o.user_id = $1';
  if (user.role === 'admin') { where = '1 = 1'; params.length = 0; }

  const { rows } = await query(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM storage_orders o
       LEFT JOIN users u ON u.id = o.user_id
      WHERE ${where}
      ORDER BY o.created_at DESC LIMIT 200`,
    params,
  );
  return rows;
}

async function updateStatus({ id, status, user }) {
  const allowed = ['pending', 'active', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    const e = new Error('Invalid status'); e.status = 400; throw e;
  }
  let sql, params;
  if (user.role === 'admin') {
    sql = `UPDATE storage_orders SET status = $1 WHERE id = $2 RETURNING *`;
    params = [status, id];
  } else {
    if (status !== 'cancelled') { const e = new Error('Forbidden'); e.status = 403; throw e; }
    sql = `UPDATE storage_orders SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *`;
    params = [status, id, user.id];
  }
  const { rows } = await query(sql, params);
  if (!rows[0]) { const e = new Error('Not found'); e.status = 404; throw e; }
  return rows[0];
}

async function linkPickup({ id, pickup_id, user }) {
  const { rows } = await query(
    `UPDATE storage_orders SET pickup_addon_id = $1
      WHERE id = $2 AND user_id = $3 RETURNING *`,
    [pickup_id, id, user.id],
  );
  return rows[0];
}

module.exports = {
  listItems,
  quote,
  createBooking,
  listOrders,
  updateStatus,
  linkPickup,
};
