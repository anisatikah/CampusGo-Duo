// server/config/db.js
// PostgreSQL connection pool — shared across modules.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[db] unexpected pool error:', err);
});

// Convenience query helper.
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
