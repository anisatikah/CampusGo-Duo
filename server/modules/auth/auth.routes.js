// server/modules/auth/auth.routes.js
const router = require('express').Router();
const ctrl = require('./auth.controller');
const { requireAuth } = require('./auth.middleware');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get('/me',        requireAuth, ctrl.me);

// Google Calendar OAuth (optional)
router.get('/google',          requireAuth, ctrl.googleStart);
router.get('/google/callback', ctrl.googleCallback);

module.exports = router;
