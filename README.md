# DuoPilot Campus

A university service platform for **UNIMAS & UiTM Samarahan** with two core systems:

1. **Duo Pilot Transport System** — every ride/delivery ships with a *pilot* + *co-pilot* for safety.
2. **Storage System** — daily-priced student storage for luggage, bags, and odd items.

Built with **React (Vite) + Tailwind**, **Node.js (Express)**, **PostgreSQL**, and **JWT** authentication. Optional **Google Calendar** sync with smart reminders.

---

## ✦ Features

### Duo Pilot Rides
- Pickup → drop-off with optional **multi-stop**.
- **Zone-based pricing** (A/B/C) — admin editable.
- **Surcharges**: late-night, multi-stop, urgent, public holiday, rain (admin toggle).
- Auto-assigned pilot + co-pilot, with admin override.
- Status flow: `pending → accepted → in_progress → completed` (or `cancelled`).
- Calendar event with **30-minute reminder**.

### Storage
- Catalogue: **luggage / storage bags / individual items**.
- Cart with quantity + start/end date pickers.
- **Daily price formula** (per spec):
  ```
  daily_price = ROUND((base_price + 1) / 7, 2)
  total       = daily_price × number_of_days × quantity
  minimum     = RM 5
  ```
- Live receipt re-validated server-side.
- Calendar events for **start** and **end**, with reminders **3 days** + **1 day** before end.
- **Upsell**: after booking storage, offer to book a DuoPilot pickup automatically.

### Dashboard
- Student: book ride / book storage / active orders / upcoming events.
- Admin: manage all bookings, assign crew, edit zone prices, toggle surcharges.

---

## ✦ Tech stack

| Layer    | Choice                            |
| -------- | --------------------------------- |
| Frontend | React 18 + Vite + Tailwind CSS    |
| Backend  | Node.js + Express                 |
| DB       | PostgreSQL 12+                    |
| Auth     | JWT (email + password, bcrypt)    |
| Calendar | `googleapis` (optional)           |

---

## ✦ Folder structure

```
duopilot-campus/
├── client/                  # React (Vite) app
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx          App.jsx          index.css
│       ├── api/axios.js
│       ├── context/AuthContext.jsx
│       ├── components/       (Navbar, Footer, ProtectedRoute, StatusBadge)
│       └── pages/            (Landing, Login, Register, Dashboard,
│                              BookDuoPilot, BookStorage, MyOrders, Admin)
├── server/                  # Express API
│   ├── index.js
│   ├── seed-admin.js
│   ├── .env.example
│   ├── config/               (db.js, env.js)
│   ├── modules/
│   │   ├── auth/             (routes, controller, middleware)
│   │   ├── duopilot/         (routes, controller, service)
│   │   └── storage/          (routes, controller, service)
│   └── utils/                (pricing.js, googleCalendar.js)
└── database/
    └── schema.sql
```

---

## ✦ Quick start

### 0. Prerequisites
- Node.js **18+**
- PostgreSQL **12+** running locally
- `psql` CLI on your `$PATH`

### 1. Clone & install
```bash
# from project root
cd server  && npm install
cd ../client && npm install
```

### 2. Create the database & schema
```bash
# create DB (one time)
createdb duopilot_campus

# load schema + seed data
psql duopilot_campus -f database/schema.sql
```

### 3. Configure server env
```bash
cd server
cp .env.example .env
# edit .env — at minimum set DATABASE_URL and JWT_SECRET
```

`.env` example:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgres://postgres:postgres@localhost:5432/duopilot_campus
JWT_SECRET=replace_me_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

### 4. Seed the admin user
```bash
# from server/
npm run db:seed-admin
# → creates  admin@duopilot.local / admin123  (CHANGE THIS!)
# or pass custom values:
node seed-admin.js you@unimas.my YourSecret123
```

### 5. Run it
Open two terminals.

**Terminal 1 — API:**
```bash
cd server
npm run dev          # nodemon, hot-reload
# ▸ DuoPilot Campus API ready on http://localhost:5000
```

**Terminal 2 — Web:**
```bash
cd client
npm run dev
# ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.
- Sign in as **admin@duopilot.local / admin123** to access the admin console.
- Or create a new student account from `/register`.

---

## ✦ Optional — Google Calendar

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/), enable **Google Calendar API**.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add `http://localhost:5000/api/auth/google/callback` to **Authorised redirect URIs**.
4. Add the credentials to `server/.env`:
   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```
5. Restart the server. After login, hit `GET /api/auth/google` (returns a consent URL) — visit it once and grant access.

When connected, all subsequent bookings auto-create calendar events with reminders. If credentials are missing, the app silently skips calendar sync — bookings still work fine.

---

## ✦ API reference

All `/api/*` paths. JWT in `Authorization: Bearer <token>`.

### Auth
| Method | Path                          | Body                                                      |
| ------ | ----------------------------- | --------------------------------------------------------- |
| POST   | `/api/auth/register`          | `{ name, email, password, phone?, campus? }`              |
| POST   | `/api/auth/login`             | `{ email, password }`                                     |
| GET    | `/api/auth/me`                | —                                                         |
| GET    | `/api/auth/google`            | — (returns OAuth URL)                                     |
| GET    | `/api/auth/google/callback`   | (OAuth redirect)                                          |

### DuoPilot
| Method | Path                                  | Notes                                  |
| ------ | ------------------------------------- | -------------------------------------- |
| GET    | `/api/duopilot/config`                | zones + surcharges                     |
| GET    | `/api/duopilot/crew`                  | available pilots/copilots              |
| POST   | `/api/duopilot/book`                  | create booking                         |
| GET    | `/api/duopilot/orders`                | own (or all, if admin)                 |
| PATCH  | `/api/duopilot/status/:id`            | update status (cancel; admin = any)    |
| PATCH  | `/api/duopilot/assign/:id`            | admin: assign crew                     |
| PATCH  | `/api/duopilot/surcharges/:type`      | admin: toggle surcharge                |
| PATCH  | `/api/duopilot/zones/:name`           | admin: edit base price                 |

### Storage
| Method | Path                          | Notes                                |
| ------ | ----------------------------- | ------------------------------------ |
| GET    | `/api/storage/items`          | catalogue with daily prices          |
| POST   | `/api/storage/quote`          | preview total without saving         |
| POST   | `/api/storage/book`           | create order                         |
| GET    | `/api/storage/orders`         | own (or all, if admin)               |
| PATCH  | `/api/storage/status/:id`     | update status                        |
| PATCH  | `/api/storage/pickup/:id`     | link a DuoPilot order as pickup      |

---

## ✦ Pricing reference

### Storage
```
base_price (RM, weekly reference) → daily_price = ROUND((base + 1) / 7, 2)
```

| Item                       | Base | Daily |
| -------------------------- | ---- | ----- |
| Cabin Luggage (small)      | 8.00 | 1.29  |
| Check-in Luggage (medium)  |12.00 | 1.86  |
| Check-in Luggage (large)   |16.00 | 2.43  |
| Storage Bag (M)            | 6.00 | 1.00  |
| Storage Bag (L)            | 9.00 | 1.43  |
| Box / Carton               | 5.00 | 0.86  |
| Mattress / Bedding         |10.00 | 1.57  |
| Electronics Box            | 7.00 | 1.14  |

### DuoPilot
| Zone | Label                       | Base   |
| ---- | --------------------------- | ------ |
| A    | On Campus                   | RM 4   |
| B    | Nearby (Kota Samarahan)     | RM 7   |
| C    | Town (Kuching / Tabuan)     | RM 14  |

| Surcharge        | Amount  | Default |
| ---------------- | ------- | ------- |
| Late night (≥11PM)| RM 3    | active  |
| Multi-stop       | RM 2.50 | active  |
| Urgent           | RM 5    | active  |
| Public holiday   | RM 3    | active  |
| Rain             | RM 2    | off (admin toggle) |

---

## ✦ Build for production

```bash
# client → static assets in client/dist
cd client && npm run build

# serve client/dist behind any static host (nginx/vercel/etc.)
# point server to that origin via CLIENT_URL in server/.env

cd ../server && NODE_ENV=production npm start
```

---

## ✦ License

For internal student-project use at UNIMAS / UiTM Samarahan. Adapt freely.
