// server/modules/auth/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/db');
const env = require('../../config/env');
const gcal = require('../../utils/googleCalendar');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  campus: u.campus,
  role: u.role,
  has_google: Boolean(u.google_token),
});

// ---------- POST /auth/register ----------
async function register(req, res) {
  const { name, email, password, phone, campus } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const exists = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, phone, campus)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email.toLowerCase(), hash, phone || null, campus || null],
    );
    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ user: publicUser(user), token });
  } catch (e) {
    console.error('[auth.register]', e);
    res.status(500).json({ error: 'Registration failed' });
  }
}

// ---------- POST /auth/login ----------
async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  try {
    const { rows } = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()],
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ user: publicUser(user), token });
  } catch (e) {
    console.error('[auth.login]', e);
    res.status(500).json({ error: 'Login failed' });
  }
}

// ---------- GET /auth/me ----------
async function me(req, res) {
  try {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ user: publicUser(rows[0]) });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load user' });
  }
}

// ---------- GET /auth/google ----------
function googleStart(req, res) {
  const url = gcal.getAuthUrl(String(req.user.id));
  if (!url) return res.status(503).json({ error: 'Google Calendar not configured' });
  res.json({ url });
}

// ---------- GET /auth/google/callback ----------
async function googleCallback(req, res) {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send('Missing code/state');
  try {
    const tokens = await gcal.exchangeCode(code);
    const refresh = tokens && tokens.refresh_token;
    if (refresh) {
      await query('UPDATE users SET google_token = $1 WHERE id = $2', [refresh, state]);
    }
    res.redirect(`${env.CLIENT_URL}/dashboard?google=connected`);
  } catch (e) {
    console.error('[auth.googleCallback]', e);
    res.redirect(`${env.CLIENT_URL}/dashboard?google=error`);
  }
}

module.exports = { register, login, me, googleStart, googleCallback };
