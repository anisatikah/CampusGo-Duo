// server/seed-admin.js
// Seeds a default admin user with a real bcrypt hash.
// Usage: node seed-admin.js [email] [password]

const bcrypt = require('bcrypt');
const { pool } = require('./config/db');

(async () => {
  const email = (process.argv[2] || 'admin@duopilot.local').toLowerCase();
  const password = process.argv[3] || 'admin123';

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (rows.length) {
      await pool.query(
        `UPDATE users SET password_hash = $1, role = 'admin' WHERE email = $2`,
        [hash, email],
      );
      console.log(`✓ Updated existing admin: ${email}`);
    } else {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, campus)
         VALUES ('DuoPilot Admin', $1, $2, 'admin', 'UNIMAS')`,
        [email, hash],
      );
      console.log(`✓ Created admin: ${email}`);
    }
    console.log(`  Password: ${password}  (CHANGE THIS in production!)`);
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
