// server/index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const { pool } = require('./config/db');

const authRoutes     = require('./modules/auth/auth.routes');
const duopilotRoutes = require('./modules/duopilot/duopilot.routes');
const storageRoutes  = require('./modules/storage/storage.routes');

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

// --- Health ---
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up', service: 'DuoPilot Campus API' });
  } catch (_e) {
    res.status(500).json({ ok: false, db: 'down' });
  }
});

// --- API ---
app.use('/api/auth',     authRoutes);
app.use('/api/duopilot', duopilotRoutes);
app.use('/api/storage',  storageRoutes);

// --- 404 + error fallthrough ---
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.PORT, () => {
  console.log(`▸ DuoPilot Campus API ready on http://localhost:${env.PORT}`);
  console.log(`▸ CORS origin: ${env.CLIENT_URL}`);
  console.log(`▸ Google Calendar: ${env.GOOGLE.ENABLED ? 'enabled' : 'disabled (set GOOGLE_* env vars to enable)'}`);
});
