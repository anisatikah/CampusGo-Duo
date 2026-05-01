// server/modules/storage/storage.routes.js
const router = require('express').Router();
const ctrl = require('./storage.controller');
const { requireAuth } = require('../auth/auth.middleware');

router.get('/items',  requireAuth, ctrl.items);
router.post('/quote', requireAuth, ctrl.quote);
router.post('/book',  requireAuth, ctrl.book);
router.get('/orders', requireAuth, ctrl.list);
router.patch('/status/:id',  requireAuth, ctrl.status);
router.patch('/pickup/:id',  requireAuth, ctrl.linkPickup);

module.exports = router;
