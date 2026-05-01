// server/modules/storage/storage.controller.js
const svc = require('./storage.service');

const handle = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (e) {
    console.error('[storage]', e);
    res.status(e.status || 500).json({ error: e.message || 'Server error' });
  }
};

module.exports = {
  items: handle(async (_req, res) => {
    const items = await svc.listItems();
    res.json({ items });
  }),

  quote: handle(async (req, res) => {
    const q = await svc.quote(req.body);
    res.json(q);
  }),

  book: handle(async (req, res) => {
    const data = await svc.createBooking({ user: req.user, body: req.body });
    res.status(201).json(data);
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

  linkPickup: handle(async (req, res) => {
    const order = await svc.linkPickup({
      id: req.params.id,
      pickup_id: req.body.pickup_id,
      user: req.user,
    });
    res.json({ order });
  }),
};
