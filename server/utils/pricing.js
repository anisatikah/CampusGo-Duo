// server/utils/pricing.js
// Pricing helpers for DuoPilot rides and Storage orders.

const { query } = require('../config/db');

/**
 * Round to 2 decimal places (banker-safe).
 */
const round2 = (n) => Math.round(Number(n) * 100) / 100;

/**
 * Storage daily price formula (per spec):
 *   daily_price = ROUND((base_price + 1) / 7, 2)
 */
const dailyFromBase = (base) => round2((Number(base) + 1) / 7);

/**
 * Number of nights between two ISO date strings (inclusive day count).
 * Storage charges per day stayed; if start == end we treat as 1 day.
 */
const daysBetween = (startDate, endDate) => {
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
};

/**
 * Compute storage line items + total.
 * @param {Array<{item_id:number, qty:number}>} cart
 * @param {string} startDate yyyy-mm-dd
 * @param {string} endDate   yyyy-mm-dd
 */
async function computeStorageTotal(cart, startDate, endDate) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error('Cart must contain at least one item');
  }
  const days = daysBetween(startDate, endDate);

  const ids = cart.map((c) => c.item_id);
  const { rows } = await query(
    'SELECT id, name, category, base_price FROM storage_items WHERE id = ANY($1) AND is_active = TRUE',
    [ids],
  );
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

  const lines = cart.map((c) => {
    const item = byId[c.item_id];
    if (!item) throw new Error(`Unknown storage item id: ${c.item_id}`);
    const qty = Math.max(1, parseInt(c.qty || 1, 10));
    const dailyPrice = dailyFromBase(item.base_price);
    const lineTotal = round2(dailyPrice * days * qty);
    return {
      item_id: item.id,
      name: item.name,
      category: item.category,
      qty,
      base_price: Number(item.base_price),
      daily_price: dailyPrice,
      line_total: lineTotal,
    };
  });

  const subtotal = round2(lines.reduce((s, l) => s + l.line_total, 0));
  const total = Math.max(5.0, subtotal); // RM5 minimum

  return { lines, days, subtotal, total };
}

/**
 * Compute DuoPilot ride total.
 *  base = max(zone_from.base, zone_to.base)
 *  surcharges from `surcharges` table where is_active = TRUE.
 */
async function computeDuoPilotTotal({
  zone_from,
  zone_to,
  datetime,
  is_urgent,
  is_multi_stop,
}) {
  const { rows: zoneRows } = await query(
    'SELECT name, base_price FROM zones WHERE name = ANY($1)',
    [[zone_from, zone_to]],
  );
  if (zoneRows.length < 2 && zone_from !== zone_to) {
    throw new Error('Invalid zone(s)');
  }
  const base = Math.max(...zoneRows.map((z) => Number(z.base_price)));

  const { rows: scRows } = await query(
    'SELECT type, amount, is_active FROM surcharges',
  );
  const sc = Object.fromEntries(scRows.map((r) => [r.type, r]));

  const dt = new Date(datetime);
  const hour = dt.getHours();
  const isLateNight = hour >= 23 || hour < 5;

  // Public holiday check is left to admin toggle (sc.public_holiday.is_active)
  // Rain is a global admin toggle.

  const applied = [];
  const add = (key) => {
    const row = sc[key];
    if (row && row.is_active) {
      applied.push({ type: key, amount: Number(row.amount) });
    }
  };

  if (isLateNight) add('late_night');
  if (is_multi_stop) add('multi_stop');
  if (is_urgent) add('urgent');
  // Holiday + rain are always evaluated by admin toggle:
  if (sc.public_holiday && sc.public_holiday.is_active) add('public_holiday');
  if (sc.rain && sc.rain.is_active) add('rain');

  // dedupe by type (in case of duplicate adds)
  const seen = new Set();
  const finalSurcharges = applied.filter((s) =>
    seen.has(s.type) ? false : (seen.add(s.type), true),
  );

  const surchargeTotal = round2(
    finalSurcharges.reduce((s, x) => s + x.amount, 0),
  );
  const total = round2(base + surchargeTotal);

  return { base, surcharges: finalSurcharges, surchargeTotal, total };
}

module.exports = {
  round2,
  dailyFromBase,
  daysBetween,
  computeStorageTotal,
  computeDuoPilotTotal,
};
