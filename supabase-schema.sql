-- ParkVault Database Schema
-- Run this in Supabase SQL Editor

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'gatekeeper')),
  vehicle_no TEXT,
  wallet_balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parking Lots table
CREATE TABLE parking_lots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10,7) DEFAULT 31.5204,
  lng DECIMAL(10,7) DEFAULT 74.3587,
  total_slots INT NOT NULL DEFAULT 20,
  available_slots INT NOT NULL DEFAULT 20,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 50,
  walkin_percentage INT DEFAULT 50,
  has_2wheeler BOOLEAN DEFAULT true,
  has_4wheeler BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Slots table
CREATE TABLE slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lot_id UUID REFERENCES parking_lots(id) ON DELETE CASCADE,
  slot_number TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('2wheeler', '4wheeler')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  UNIQUE(lot_id, slot_number)
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  slot_id UUID REFERENCES slots(id) ON DELETE SET NULL,
  lot_id UUID REFERENCES parking_lots(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'pending')),
  qr_code TEXT UNIQUE NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0,
  vehicle_no TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (wallet)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'unpaid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gatekeeper assignments
CREATE TABLE gatekeeper_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  lot_id UUID REFERENCES parking_lots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_lot ON bookings(lot_id);
CREATE INDEX idx_slots_lot ON slots(lot_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);

-- Functions
CREATE OR REPLACE FUNCTION increment_slots(lot_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE parking_lots
  SET available_slots = available_slots + 1
  WHERE id = lot_id AND available_slots < total_slots;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_slots(lot_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE parking_lots
  SET available_slots = available_slots - 1
  WHERE id = lot_id AND available_slots > 0;
END;
$$ LANGUAGE plpgsql;

-- Seed admin user (set your own password)
INSERT INTO users (name, email, password, role, wallet_balance)
VALUES ('Admin', 'admin@parkvault.com', 'change-this-password', 'admin', 0)
ON CONFLICT (email) DO NOTHING;

-- Seed gatekeeper user (set your own password)
INSERT INTO users (name, email, password, role, wallet_balance)
VALUES ('Gatekeeper', 'gate@parkvault.com', 'change-this-password', 'gatekeeper', 0)
ON CONFLICT (email) DO NOTHING;

-- Seed user (password: user123)
INSERT INTO users (name, email, password, role, wallet_balance, vehicle_no)
VALUES ('John Doe', 'john@example.com', 'user123', 'user', 500, 'ABC-123')
ON CONFLICT (email) DO NOTHING;

-- Seed parking lot
INSERT INTO parking_lots (name, address, total_slots, available_slots, hourly_rate)
VALUES ('Mall Road Parking', 'Mall Road, Lahore', 30, 30, 50)
ON CONFLICT DO NOTHING;

-- OTP codes for email login
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  role TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);

-- Pricing rules (dynamic pricing)
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lot_id UUID REFERENCES parking_lots(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Peak Hour',
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_lot ON pricing_rules(lot_id);

-- Monthly subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  lot_id UUID REFERENCES parking_lots(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  fee DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- Staff shifts (gatekeeper schedule)
CREATE TABLE IF NOT EXISTS staff_shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  lot_id UUID REFERENCES parking_lots(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'missed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_user ON staff_shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_lot ON staff_shifts(lot_id);

-- Add floor/section columns to slots table
ALTER TABLE slots ADD COLUMN IF NOT EXISTS floor INT DEFAULT 1;
ALTER TABLE slots ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'A';

-- Disable RLS for now
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE parking_lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Login logs table
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('password', 'otp')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY;
