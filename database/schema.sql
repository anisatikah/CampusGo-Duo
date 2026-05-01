-- =====================================================
-- DuoPilot Campus - Database Schema
-- PostgreSQL 12+
-- =====================================================

DROP TABLE IF EXISTS storage_orders CASCADE;
DROP TABLE IF EXISTS storage_items CASCADE;
DROP TABLE IF EXISTS duopilot_orders CASCADE;
DROP TABLE IF EXISTS surcharges CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS crew CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    phone           VARCHAR(30),
    campus          VARCHAR(40),                 -- 'UNIMAS' | 'UiTM'
    role            VARCHAR(20) DEFAULT 'user',  -- 'user' | 'admin'
    google_token    TEXT,                        -- optional, for calendar
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREW (pilots & co-pilots)
-- =====================================================
CREATE TABLE crew (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    phone       VARCHAR(30),
    role        VARCHAR(20) NOT NULL,  -- 'pilot' | 'copilot'
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ZONES (fixed pricing)
-- =====================================================
CREATE TABLE zones (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(40) UNIQUE NOT NULL,  -- 'A' | 'B' | 'C'
    label       VARCHAR(100) NOT NULL,
    base_price  NUMERIC(8,2) NOT NULL
);

-- =====================================================
-- SURCHARGES
-- =====================================================
CREATE TABLE surcharges (
    id          SERIAL PRIMARY KEY,
    type        VARCHAR(40) UNIQUE NOT NULL,  -- 'late_night' | 'multi_stop' | 'urgent' | 'public_holiday' | 'rain'
    label       VARCHAR(120) NOT NULL,
    amount      NUMERIC(8,2) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- DUO PILOT ORDERS
-- =====================================================
CREATE TABLE duopilot_orders (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pickup_location     TEXT NOT NULL,
    dropoff_location    TEXT NOT NULL,
    extra_stops         JSONB DEFAULT '[]'::jsonb,
    zone_from           VARCHAR(10) NOT NULL,
    zone_to             VARCHAR(10) NOT NULL,
    datetime            TIMESTAMPTZ NOT NULL,
    pilot_id            INTEGER REFERENCES crew(id),
    copilot_id          INTEGER REFERENCES crew(id),
    is_urgent           BOOLEAN DEFAULT FALSE,
    is_multi_stop       BOOLEAN DEFAULT FALSE,
    base_price          NUMERIC(8,2) NOT NULL,
    surcharge_total     NUMERIC(8,2) DEFAULT 0,
    total_price         NUMERIC(8,2) NOT NULL,
    status              VARCHAR(30) DEFAULT 'pending',  -- pending | accepted | in_progress | completed | cancelled
    notes               TEXT,
    calendar_event_id   TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STORAGE ITEMS (catalogue)
-- =====================================================
CREATE TABLE storage_items (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    category    VARCHAR(60) NOT NULL,   -- 'luggage' | 'storage_bag' | 'individual'
    base_price  NUMERIC(8,2) NOT NULL,  -- weekly base; daily computed = ROUND((base+1)/7, 2)
    description TEXT,
    is_active   BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- STORAGE ORDERS
-- =====================================================
CREATE TABLE storage_orders (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items               JSONB NOT NULL,         -- [{item_id, name, qty, base_price, daily_price, line_total}]
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    number_of_days      INTEGER NOT NULL,
    subtotal            NUMERIC(8,2) NOT NULL,
    total_price         NUMERIC(8,2) NOT NULL,  -- after RM5 minimum
    status              VARCHAR(30) DEFAULT 'pending',
    pickup_addon_id     INTEGER REFERENCES duopilot_orders(id),  -- upsell link
    calendar_start_id   TEXT,
    calendar_end_id     TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SEED DATA
-- =====================================================
INSERT INTO zones (name, label, base_price) VALUES
    ('A', 'Zone A — On Campus (UNIMAS / UiTM Samarahan)', 4.00),
    ('B', 'Zone B — Nearby (Kota Samarahan / Desa Ilmu)', 7.00),
    ('C', 'Zone C — Town (Kuching / Tabuan)', 14.00);

INSERT INTO surcharges (type, label, amount, is_active) VALUES
    ('late_night',     'Late Night (after 11 PM)', 3.00, TRUE),
    ('multi_stop',     'Multi-Stop Booking',       2.50, TRUE),
    ('urgent',         'Urgent Priority',          5.00, TRUE),
    ('public_holiday', 'Public Holiday',           3.00, TRUE),
    ('rain',           'Rainy Weather',            2.00, FALSE);

INSERT INTO storage_items (name, category, base_price, description) VALUES
    ('Cabin Luggage (small)',   'luggage',      8.00,  'Up to 20" / 7kg'),
    ('Check-in Luggage (medium)','luggage',     12.00, 'Up to 24" / 15kg'),
    ('Check-in Luggage (large)','luggage',      16.00, 'Up to 28" / 23kg'),
    ('Storage Bag (M)',         'storage_bag',  6.00,  '60L jumbo bag'),
    ('Storage Bag (L)',         'storage_bag',  9.00,  '90L jumbo bag'),
    ('Box / Carton',            'individual',   5.00,  'Standard carton box'),
    ('Mattress / Bedding',      'individual',   10.00, 'Single rolled mattress'),
    ('Electronics Box',         'individual',   7.00,  'Monitor / printer sized');

INSERT INTO crew (name, phone, role) VALUES
    ('Aiman Hafiz',  '+60 12-345 6789', 'pilot'),
    ('Hafiz Razak',  '+60 13-456 7890', 'pilot'),
    ('Nurul Aina',   '+60 14-567 8901', 'copilot'),
    ('Siti Hawa',    '+60 17-678 9012', 'copilot');

-- Default admin user is seeded via `npm run seed:admin` (server)
-- which generates a real bcrypt hash. See server/seed-admin.js.

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_duopilot_user      ON duopilot_orders(user_id);
CREATE INDEX idx_duopilot_status    ON duopilot_orders(status);
CREATE INDEX idx_duopilot_datetime  ON duopilot_orders(datetime);
CREATE INDEX idx_storage_user       ON storage_orders(user_id);
CREATE INDEX idx_storage_status     ON storage_orders(status);
CREATE INDEX idx_storage_dates      ON storage_orders(start_date, end_date);
