// server/modules/duopilot/duopilot.routes.js
const router = require('express').Router();
const ctrl = require('./duopilot.controller');
const { requireAuth, requireAdmin } = require('../auth/auth.middleware');

// Public-ish (auth required) config
router.get('/config', requireAuth, ctrl.config);
router.get('/crew',   requireAuth, ctrl.crew);

// User flows
router.post('/book',  requireAuth, ctrl.book);
router.get('/orders', requireAuth, ctrl.list);
router.patch('/status/:id', requireAuth, ctrl.status);

// Admin flows
router.patch('/assign/:id',          requireAuth, requireAdmin, ctrl.assign);
router.patch('/surcharges/:type',    requireAuth, requireAdmin, ctrl.toggleSurcharge);
router.patch('/zones/:name',         requireAuth, requireAdmin, ctrl.updateZone);

module.exports = router;
