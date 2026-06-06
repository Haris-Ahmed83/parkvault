# ParkVault — Smart Parking Management System

A full-featured, production-ready smart parking management web app built with **Next.js 16**, **TypeScript**, **Supabase**, and **Tailwind CSS**. Supports three roles — Admin, Gatekeeper, and User — with real-time slot updates, dynamic pricing, QR code scanning, monthly subscriptions, and email OTP authentication.

---

## ✨ Features

### 👤 User
- **Find Parking** — Browse nearby lots sorted by GPS distance with Leaflet/OpenStreetMap
- **Interactive Slot Grid** — Book manually by floor/section with visual availability
- **Dynamic Pricing** — Rates adjusted by day-of-week and time-of-day multipliers
- **Real-time Updates** — Slot counts update instantly via Supabase Realtime
- **QR Code Check-in** — Scan-to-enter at the gate
- **Wallet** — Add funds and track transaction history
- **Monthly Subscriptions** — 1/3/6 month passes with wallet deduction
- **OTP Login** — Passwordless login via email OTP
- **Email Confirmations** — Booking confirmation emails delivered via Gmail SMTP

### 🛡️ Gatekeeper
- **QR Scanner** — Built-in camera QR scanner (jsQR) to validate bookings
- **Walk-in Check-in** — Manual walk-in registration with lot selection
- **Check-out** — Complete bookings and free up slots

### ⚙️ Admin
- **Dashboard** — Real-time analytics with charts (Recharts)
- **Parking Lots** — CRUD for lots and slots
- **Users** — View and manage all users
- **Gatekeepers** — Assign gatekeepers to specific lots
- **Pricing Rules** — Configure day/time-based multipliers per lot
- **Staff Shifts** — Schedule gatekeeper shifts
- **Login Logs** — Track all user login activity
- **CSV Export** — Export bookings, revenue, and transaction reports

---

## 🚀 Live Demo

**https://parkvault.vercel.app**

| Role | Email | Password |
|------|-------|----------|
| Admin | *(contact owner)* | *(contact owner)* |
| User | *(register new)* | *(set during registration)* |
| Gatekeeper | *(register new)* | *(set during registration)* |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Auth** | NextAuth v5 (Credentials + JWT) |
| **Database** | Supabase (PostgreSQL + Realtime) |
| **Maps** | Leaflet + OpenStreetMap (free, no API key) |
| **QR Scanner** | jsQR (browser-based, zero dependency) |
| **Email** | Gmail SMTP (via Nodemailer) |
| **UI** | Tailwind CSS 4, Framer Motion, Radix UI |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 🏗️ Architecture

```
📦 src
 ┣ 📂 app
 ┃ ┣ 📂 api          — REST API routes (auth, bookings, lots, etc.)
 ┃ ┣ 📂 dashboard
 ┃ ┃ ┣ 📂 admin      — Admin panel (lots, users, pricing, shifts, logs)
 ┃ ┃ ┣ 📂 user       — User dashboard (find parking, wallet, subscriptions)
 ┃ ┃ ┗ 📂 gatekeeper — Gatekeeper panel (scan, check-in/out)
 ┃ ┣ 📜 login        — Login page (password + OTP)
 ┃ ┗ 📜 register     — Registration page
 ┣ 📂 components
 ┃ ┣ 📂 layout       — Navbar, Sidebar, ThemeToggle, Footer
 ┃ ┣ 📂 maps         — Leaflet-based ParkingMap component
 ┃ ┣ 📂 shared       — QRScanner, WalletCard, etc.
 ┃ ┗ 📂 ui           — Reusable UI primitives (Button, Input, etc.)
 ┣ 📂 lib
 ┃ ┣ 📜 auth.ts      — NextAuth config (Credentials + JWT)
 ┃ ┣ 📜 email.ts     — Email service (SMTP + Resend fallback)
 ┃ ┗ 📜 supabase.ts  — Supabase client (anon + admin/service-role)
 ┗ 📂 types           — TypeScript type definitions
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 20+
- Supabase project (free tier)
- Gmail account with App Password (for email)

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/parkvault.git
cd parkvault

# Install dependencies
npm install

# Create .env.local (copy from .env.example)
cp .env.example .env.local
```

Configure your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_SECRET=your-auth-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### Database

Run the SQL from `supabase-schema.sql` in your Supabase SQL Editor to create all tables.

### Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| **Login** | Role selection + password / OTP login |
| **Find Parking** | Map view with nearby lots, slot grid, dynamic pricing |
| **Wallet** | Balance, top-up, transaction history |
| **Subscriptions** | Purchase monthly passes (1/3/6 months) |
| **Admin Dashboard** | Analytics, charts, stats overview |
| **Admin Pricing** | Configure day/time multipliers per lot |
| **Admin Login Logs** | View all user login activity |
| **Gatekeeper Scan** | Camera QR scanner + walk-in check-in |

---

## 📄 License

MIT — feel free to use, modify, and distribute.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📬 Contact

Built with ❤️ by [Your Name](https://github.com/YOUR_USERNAME)
