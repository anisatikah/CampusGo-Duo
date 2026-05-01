// server/config/env.js
// Single source of truth for environment variables.

require('dotenv').config();

module.exports = {
  PORT:           parseInt(process.env.PORT || '5000', 10),
  NODE_ENV:       process.env.NODE_ENV || 'development',
  CLIENT_URL:     process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL:   process.env.DATABASE_URL,
  JWT_SECRET:     process.env.JWT_SECRET || 'dev_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GOOGLE: {
    CLIENT_ID:     process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI:  process.env.GOOGLE_REDIRECT_URI,
    ENABLED: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },
};
