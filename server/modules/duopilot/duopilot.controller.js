// server/modules/duopilot/duopilot.controller.js
const svc = require('./duopilot.service');

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    console.error('[duopilot]', e);
    res.status(e.status || 500).json({ error: e.message || 'Server error' });
  }
};

module.exports = {
  book: handle(async (req, res) => {
    const { order, pricing } = await svc.createBooking({ user: req.user, body: req.body });
    res.status(201).json({ order, pricing });
  }),

  list: handle(async (req, res) => {
    const orders = await svc.listOrders({ user: req.user });
    res.json({ orders });
  }),

  status: handle(async (req, res) => {
    const order = await svc.updateStatus({
      id: req.params.id,
      status: req.body.status,
      user: req.user,
    });
    res.json({ order });
  }),

  assign: handle(async (req, res) => {
    const order = await svc.assignCrew({
      id: req.params.id,
      pilot_id: req.body.pilot_id,
      copilot_id: req.body.copilot_id,
    });
    res.json({ order });
  }),

  config: handle(async (_req, res) => {
    const data = await svc.getZonesAndSurcharges();
    res.json(data);
  }),

  crew: handle(async (_req, res) => {
    const crew = await svc.getCrew();
    res.json({ crew });
  }),

  toggleSurcharge: handle(async (req, res) => {
    const row = await svc.toggleSurcharge({
      type: req.params.type,
      is_active: req.body.is_active,
    });
    res.json({ surcharge: row });
  }),

  updateZone: handle(async (req, res) => {
    const row = await svc.updateZonePrice({
      name: req.params.name,
      base_price: req.body.base_price,
    });
    res.json({ zone: row });
  }),
};
