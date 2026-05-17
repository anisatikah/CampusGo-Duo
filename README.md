# CampusGo — Campus Services Super App

A modern, mobile-first campus services super app built for university students (UNIMAS / UiTM style audience). Book storage, request runners, and submit print jobs — all from your phone.

## Features

### Student App
- **Storage Service** — Semester break storage with daily rate pricing (S/M/L categories)
- **Runner Service** — Food, parcel, grocery, and custom errands
- **Printing Service** — B&W and color printing with pickup/delivery
- **Order Tracking** — Real-time order status updates via Firebase
- **Profile** — User info, order history, stats

### Admin Dashboard
- Student database with search
- Order management (update status across all services)
- Revenue analytics with breakdowns
- Real-time data from Firestore

## Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Frontend    | Next.js 14 + React 18   |
| Styling     | Tailwind CSS            |
| Auth        | Firebase Authentication |
| Database    | Cloud Firestore         |
| Storage     | Firebase Storage        |
| Hosting     | Vercel                  |

## Design System

- **Primary:** `#7C4DFF` (Purple)
- **Secondary:** `#F5F3FF`
- **Typography:** Poppins (headings) + Inter (body)
- **Style:** Rounded cards, soft shadows, mobile-first

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/anisatikah/campusgo-duo.git
cd campusgo-duo
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password provider
4. Enable **Firestore Database** (start in test mode, then apply security rules)
5. Enable **Storage**
6. Go to **Project Settings → Your Apps** → Add a Web App
7. Copy the Firebase config

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_WHATSAPP=601XXXXXXXXX
```

### 4. Apply Firestore security rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

Or paste `firestore.rules` manually in Firebase Console → Firestore → Rules.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Create first admin user

1. Register a student account at `/register`
2. In Firebase Console → Firestore → `users` collection
3. Find the document for your email → edit `role` field to `admin`
4. Admin dashboard is at `/admin`

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to [Vercel](https://vercel.com) and add environment variables in the Vercel dashboard.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & Register pages
│   │   ├── login/
│   │   └── register/
│   ├── (main)/           # Student app (protected)
│   │   ├── dashboard/
│   │   ├── services/
│   │   │   ├── storage/
│   │   │   ├── runner/
│   │   │   └── printing/
│   │   ├── orders/
│   │   ├── chat/
│   │   └── profile/
│   ├── admin/            # Admin dashboard (role-protected)
│   │   ├── users/
│   │   ├── orders/
│   │   └── analytics/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # Button, Card, Input, Badge, Select, Textarea
│   ├── layout/           # BottomNav, TopBar, MainLayout
│   └── dashboard/        # StatCard
├── context/
│   └── AuthContext.tsx   # Firebase Auth + user profile
├── hooks/
│   └── useOrders.ts      # Firestore real-time order hooks
├── lib/
│   ├── firebase.ts       # Firebase app init
│   └── utils.ts          # Pricing, formatting, helpers
└── types/
    └── index.ts          # TypeScript types + storage rates
```

## Storage Pricing

| Size  | 1 item | 2 items | 3 items | Max qty |
|-------|--------|---------|---------|---------|
| S     | RM0.45 | RM0.78  | RM1.04  | 10      |
| M     | RM0.71 | RM1.17  | RM1.56  | 6       |
| L     | RM0.97 | RM1.69  | RM2.34  | 4       |

Formula: `total = daily_rate × total_days`

## Firestore Collections

| Collection       | Description                  |
|------------------|------------------------------|
| `users`          | Student profiles             |
| `storage_orders` | Semester break storage       |
| `runner_orders`  | Food/parcel/grocery runners  |
| `printing_orders`| Print jobs                   |
| `notifications`  | Push notifications           |

## License

For internal student-project use at UNIMAS / UiTM. Adapt freely.
