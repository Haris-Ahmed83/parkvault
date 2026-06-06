# ParkVault — Smart Parking Management System

## Project Proposal & System Documentation

---

## 1. Executive Summary

ParkVault is a web-based smart parking management system that allows users to find, reserve, and pay for parking spaces in real time. The system supports three user roles — **Admin**, **User**, and **Gatekeeper** — each with distinct permissions and workflows. It features interactive maps, QR-code-based entry/exit, wallet payments, email OTP authentication, dynamic pricing, monthly subscriptions, and real-time slot updates.

**Tech Stack:** Next.js 16 (Fullstack) + TypeScript + Supabase (PostgreSQL) + Tailwind CSS + Leaflet/OpenStreetMap

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Admin    │  │ User     │  │Gatekeeper│  │ Landing │ │
│  │ Dashboard│  │ Dashboard│  │ Dashboard│  │  Pages  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       └──────────────┴─────────────┴──────────────┘      │
│                         │                                │
│              ┌──────────┴──────────┐                     │
│              │   NextAuth v5 JWT   │                     │
│              │  Session + Cookies  │                     │
│              └──────────┬──────────┘                     │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│              ┌──────────┴──────────┐                     │
│              │   Next.js API Routes│                     │
│              │  (Server-side with  │                     │
│              │   service_role key) │                     │
│              └──────────┬──────────┘                     │
│                         │                                │
│              ┌──────────┴──────────┐                     │
│              │    Supabase (PostgreSQL)                  │
│              │    + Realtime + Auth                     │
│              └─────────────────────┘                     │
│                                                          │
│  External Services:                                      │
│  ┌──────────────┐  ┌──────────────────┐                 │
│  │ Resend (Email)│  │ OpenStreetMap    │                 │
│  │ OTP + Booking │  │ (Free Maps API)  │                 │
│  │ Confirmations │  │ Leaflet.js       │                 │
│  └──────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

**Hosting:** Vercel (Production)  
**Database:** Supabase (PostgreSQL with Realtime)  
**Authentication:** NextAuth v5 (Credentials + JWT)  
**Maps:** Leaflet + OpenStreetMap (Free, Unlimited)  
**Emails:** Resend (100 emails/day free)  
**Payments:** Wallet-based (simulated, no gateway)

---

## 3. User Roles & Permissions

### 3.1 Admin (Super Admin — Owner Only)

| Permission | Description |
|-----------|-------------|
| Dashboard Overview | See total users, bookings, revenue, occupancy rate |
| Parking Lots | Create, edit, delete parking lots with map location picker |
| Users | View all users, search, delete accounts |
| Gatekeepers | Add/remove gatekeepers, assign them to specific parking lots |
| Bookings | View all bookings across all lots, filter by status |
| Analytics | Revenue statistics, completion rate, cancellation rate, charts |
| Pricing Rules | Set dynamic pricing (peak hours, day-of-week multipliers) |
| Staff Shifts | Schedule gatekeeper shifts with start/end times |
| Settings | Configure base hourly rates, walk-in percentages |
| Export Data | Download CSV reports (bookings, revenue, transactions) |

**What Admin CANNOT do:**
- Book parking slots (admin is management-only)
- Scan QR codes at gates
- Access user or gatekeeper dashboards
- View other admin accounts

### 3.2 User (Parking Customers)

| Permission | Description |
|-----------|-------------|
| Dashboard | View wallet balance, active booking, recent bookings |
| Find Parking | Browse lots on map, see nearby lots by distance, select floor/slot |
| Book Slot | Reserve a specific parking slot (floor + slot number) |
| Dynamic Pricing | See real-time peak-hour pricing before booking |
| My Bookings | View all bookings, show QR code for gate entry, cancel active bookings |
| Wallet | View balance, top up with preset amounts, transaction history |
| Monthly Passes | Purchase 1/3/6 month subscriptions for a specific lot |
| Profile | Edit name, phone, vehicle number |
| Get Directions | Get OSM directions to the parking lot |

**What User CANNOT do:**
- Access admin or gatekeeper panels
- Manage parking lots or pricing
- Scan QR codes at gates
- View other users' data or bookings
- Cancel completed bookings

### 3.3 Gatekeeper (Security / Gate Staff)

| Permission | Description |
|-----------|-------------|
| Dashboard | View assigned lot status, today's check-in/check-out count |
| Scan QR | Enter QR code manually or scan via camera to verify bookings |
| Check-in | Mark pending bookings as active, walk-in vehicles without booking |
| Check-out | Mark active bookings as completed, calculate fee |
| Activity Logs | View today's entry/exit records filtered by assigned lot |

**What Gatekeeper CANNOT do:**
- Access admin or user dashboards
- Create/modify parking lots or pricing
- View wallet or financial data
- Book parking slots
- Edit user profiles

---

## 4. System Workflows

### 4.1 Authentication Flow

```
[User] → [Login Page] → [Select Role] → [Enter Email]
    │                                              │
    ├── [Password Mode] ── Enter Password ────────┤
    │                                              │
    └── [OTP Mode] ── "Send OTP" → Email receives
                     6-digit code → Enter OTP ────┤
                                                   ↓
                                           [NextAuth JWT Created]
                                                   ↓
                                        [Redirect to Role Dashboard]
```

- Admin: Password-only login (OTP disabled for security)
- User/Gatekeeper: Password OR OTP login
- OTP expires in 10 minutes
- JWT sessions last 7 days

### 4.2 Booking Flow (User)

```
[Find Parking Page]
         │
         ├── Map loads with lot markers (green=available, red=full)
         │
         ├── Nearby lots sorted by distance (GPS)
         │
         ├── User clicks a lot or marker
         │
         ├── Slot grid appears (grouped by floor)
         │     ├── Green = Available
         │     ├── Red = Occupied
         │     └── Blue = Reserved
         │
         ├── User selects a specific slot
         │
         ├── Dynamic pricing shown (peak hours ×1.5)
         │
         ├── User enters vehicle number & hours
         │
         ├── System checks wallet balance
         │     ├── Insufficient → "Top up your wallet" alert
         │     └── Sufficient → Proceed
         │
         ├── Booking created (status: active)
         │     ├── Slot marked as occupied
         │     ├── Lot available_slots decreased
         │     ├── Wallet deducted
         │     ├── Transaction recorded
         │     └── Confirmation email sent
         │
         └── QR code generated for gate entry
```

### 4.3 Gate Entry/Exit Flow (Gatekeeper)

```
[Gatekeeper Dashboard]
        │
        ├── [Scan QR Code]
        │      │
        │      ├── Enter QR code manually (paste)
        │      │
        │      └── OR Scan via camera (jsQR)
        │             │
        │             ↓
        │     [System looks up booking]
        │            │
        │     ┌──────┴──────┐
        │     │             │
        │   Pending       Active
        │     │             │
        │     ↓             ↓
        │  Mark as       Mark as
        │  Active        Completed
        │  (Check-in)    (Check-out)
        │                │
        │         Slot released
        │         Lot available_slots ↑
        │
        └── [Walk-in Check-in]
               │
               ├── Select lot from dropdown
               ├── Enter vehicle number
               ├── Booking created (active)
               ├── Slot occupied
               └── Lot available_slots decreased
```

### 4.4 Subscription Flow (Monthly Pass)

```
[User → Subscriptions Page]
        │
        ├── View active subscription
        │     ├── Lot name, date range, fee
        │     └── Status badge (active/expired/cancelled)
        │
        └── [Purchase New Subscription]
               │
               ├── Select lot from list
               ├── Choose duration: 1/3/6 months
               ├── Fee calculated: (hourly_rate × 8hr × 30days) × months
               ├── System checks wallet
               │    ├── Insufficient → Error message
               │    └── Sufficient → Wallet deducted
               │
               └── Subscription created (active)
```

### 4.5 Wallet & Payments Flow

```
[Wallet Management]
        │
        ├── [Top Up]
        │     ├── Preset amounts: PKR 500, 1000, 2000, 5000
        │     ├── OR custom amount
        │     ├── Credit transaction recorded
        │     └── Balance updated
        │
        └── [Deductions]
              ├── Booking fee deducted on reservation
              ├── Subscription fee on pass purchase
              └── Debit transaction recorded
```

---

## 5. Database Schema

### 5.1 Core Tables

| Table | Purpose |
|-------|---------|
| `users` | All users (admin, gatekeeper, customer) with wallet balance |
| `parking_lots` | Parking locations with coordinates, slots, rates |
| `slots` | Individual parking slots with floor/section, status tracking |
| `bookings` | All reservations with QR codes, fees, timestamps |
| `transactions` | Wallet credit/debit history |
| `invoices` | Booking invoices |
| `otp_codes` | One-time passwords for email login |

### 5.2 Advanced Tables

| Table | Purpose |
|-------|---------|
| `pricing_rules` | Dynamic pricing: day-of-week, time-range, multiplier |
| `subscriptions` | Monthly pass subscriptions for users |
| `staff_shifts` | Gatekeeper schedule management |
| `gatekeeper_assignments` | Lot-to-gatekeeper assignments |

---

## 6. Key Technical Features

| Feature | Implementation |
|---------|---------------|
| **Real-time Updates** | Supabase Realtime channel on `parking_lots` table — live slot count |
| **Dynamic Pricing** | Time/day-based rules with configurable multipliers |
| **QR Scanning** | jsQR library + device camera (MediaDevices API) |
| **Email Notifications** | Resend API for OTP and booking confirmations |
| **PWA** | Manifest + responsive design, installable on mobile |
| **Maps** | Leaflet + OpenStreetMap tiles (free, no API key) |
| **OTP Auth** | 6-digit code via email, 10-minute expiry |
| **Export** | CSV download for bookings, revenue, transactions |
| **Nearby Sorting** | GPS-based distance calculation (Haversine formula) |

---

## 7. Security Model

- **RLS:** Currently disabled for simplicity (all data accessible via API)
- **API Routes:** Server-side only, use `supabaseAdmin` (service_role key)
- **Client:** Uses `supabase` (anon key) with restricted queries
- **Session:** NextAuth JWT stored in HTTP cookie, 7-day expiry
- **OTP:** Single-use, 10-minute expiry, tied to email + role
- **Wallet:** Balance checked before any deduction
- **CORS:** Not applicable (same-origin via Vercel)

---

## 8. Deployment Architecture

```
                      ┌─────────────┐
                      │   Vercel    │
                      │  (CDN +    │
                      │  Serverless)│
                      └──────┬──────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
        ┌─────┴─────┐              ┌────────┴────────┐
        │ Next.js   │              │ Next.js API     │
        │ Frontend  │              │ Routes          │
        │ (Edge)    │              │ (Serverless FN) │
        └───────────┘              └────────┬────────┘
                                            │
                                   ┌────────┴────────┐
                                   │    Supabase     │
                                   │  (PostgreSQL +  │
                                   │   Realtime)     │
                                   └─────────────────┘
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key (client-side)
- `SUPABASE_SERVICE_ROLE_KEY` — Secret key (server-side only)
- `AUTH_SECRET` — NextAuth encryption key
- `RESEND_API_KEY` — Email service API key

---

## 9. Future Enhancements (Phase 2)

| Feature | Description |
|---------|-------------|
| Push Notifications | Browser push alerts for booking reminders |
| Multi-Branch | Single admin managing lots across multiple cities |
| EV Charging | Electric vehicle charging slot management |
| License Plate OCR | Auto-detect vehicle number via camera |
| Review System | User ratings for parking lots |
| Referral Program | Reward users for inviting others |
| AI Predictions | Predict occupancy based on historical data |

---

## 10. Conclusion

ParkVault delivers a production-ready, fully functional smart parking management system at zero infrastructure cost. By leveraging free-tier services (Supabase, Vercel, Resend, OpenStreetMap), the system handles the complete parking lifecycle — from discovery and booking to entry, exit, billing, and analytics.

**Total Routes:** 38 (9 API + 29 Pages)  
**Database Tables:** 12  
**User Roles:** 3 (Admin, User, Gatekeeper)  
**Deployment:** Live at [https://parkvault.vercel.app](https://parkvault.vercel.app)

---

*Document Version 1.0 — June 2026*
