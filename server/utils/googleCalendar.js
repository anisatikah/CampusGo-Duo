// server/utils/googleCalendar.js
// Optional Google Calendar integration. Gracefully no-ops when credentials
// are missing so the rest of the app keeps working.

const env = require('../config/env');

let google = null;
try {
  // Only require the lib if it's installed (it is, but stay defensive).
  ({ google } = require('googleapis'));
} catch (_e) {
  google = null;
}

/**
 * Build an authenticated calendar client from a stored refresh token.
 */
function buildClient(refreshToken) {
  if (!google || !env.GOOGLE.ENABLED || !refreshToken) return null;
  const oauth2 = new google.auth.OAuth2(
    env.GOOGLE.CLIENT_ID,
    env.GOOGLE.CLIENT_SECRET,
    env.GOOGLE.REDIRECT_URI,
  );
  oauth2.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: 'v3', auth: oauth2 });
}

/**
 * Generate the OAuth consent URL the frontend should redirect users to.
 */
function getAuthUrl(state) {
  if (!google || !env.GOOGLE.ENABLED) return null;
  const oauth2 = new google.auth.OAuth2(
    env.GOOGLE.CLIENT_ID,
    env.GOOGLE.CLIENT_SECRET,
    env.GOOGLE.REDIRECT_URI,
  );
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state,
  });
}

/**
 * Exchange an OAuth code for tokens.
 */
async function exchangeCode(code) {
  if (!google || !env.GOOGLE.ENABLED) return null;
  const oauth2 = new google.auth.OAuth2(
    env.GOOGLE.CLIENT_ID,
    env.GOOGLE.CLIENT_SECRET,
    env.GOOGLE.REDIRECT_URI,
  );
  const { tokens } = await oauth2.getToken(code);
  return tokens; // contains refresh_token on first consent
}

/**
 * Create a calendar event. Returns {id} or null if disabled / failed.
 *
 * @param {string|null} refreshToken
 * @param {Object} opts
 * @param {string} opts.summary
 * @param {string} opts.description
 * @param {Date|string} opts.start
 * @param {Date|string} opts.end
 * @param {number[]} [opts.remindersMinutes] e.g. [30] or [3*24*60, 24*60]
 */
async function createEvent(refreshToken, opts) {
  const cal = buildClient(refreshToken);
  if (!cal) return null;

  try {
    const reminders = (opts.remindersMinutes || []).map((m) => ({
      method: 'popup',
      minutes: m,
    }));

    const res = await cal.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: opts.summary,
        description: opts.description,
        start: { dateTime: new Date(opts.start).toISOString() },
        end:   { dateTime: new Date(opts.end).toISOString() },
        reminders: reminders.length
          ? { useDefault: false, overrides: reminders }
          : undefined,
      },
    });
    return { id: res.data.id, htmlLink: res.data.htmlLink };
  } catch (e) {
    console.warn('[gcal] create event failed:', e.message);
    return null;
  }
}

module.exports = { getAuthUrl, exchangeCode, createEvent };
