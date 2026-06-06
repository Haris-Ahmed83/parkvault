export type UserRole = "user" | "admin" | "gatekeeper"

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  vehicle_no: string | null
  wallet_balance: number
  created_at: string
}

export interface ParkingLot {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  total_slots: number
  available_slots: number
  hourly_rate: number
  walkin_percentage: number
  has_2wheeler: boolean
  has_4wheeler: boolean
  is_active: boolean
  created_at: string
}

export interface Slot {
  id: string
  lot_id: string
  slot_number: string
  type: "2wheeler" | "4wheeler"
  status: "available" | "occupied" | "reserved"
  floor: number
  section: string
}

export interface Booking {
  id: string
  user_id: string
  slot_id: string
  lot_id: string
  start_time: string
  end_time: string | null
  status: "active" | "completed" | "cancelled" | "pending"
  qr_code: string
  fee: number
  vehicle_no: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: "credit" | "debit"
  description: string
  created_at: string
}

export interface Invoice {
  id: string
  booking_id: string
  user_id: string
  amount: number
  status: "paid" | "unpaid" | "cancelled"
  created_at: string
}

export interface GatekeeperAssignment {
  id: string
  user_id: string
  lot_id: string
  lot_name?: string
}

export interface PricingRule {
  id: string
  lot_id: string
  name: string
  day_of_week: number | null
  start_time: string
  end_time: string
  multiplier: number
  is_active: boolean
}

export interface Subscription {
  id: string
  user_id: string
  lot_id: string
  lot_name?: string
  start_date: string
  end_date: string
  fee: number
  status: "active" | "expired" | "cancelled"
  created_at: string
}

export interface StaffShift {
  id: string
  user_id: string
  lot_id: string
  start_time: string
  end_time: string
  status: "scheduled" | "active" | "completed" | "missed"
  user_name?: string
  lot_name?: string
}

export interface LoginLog {
  id: string
  user_id: string
  email: string
  name: string
  role: UserRole
  ip_address: string | null
  user_agent: string | null
  method: "password" | "otp"
  created_at: string
}

export interface DashboardStats {
  total_users: number
  total_bookings: number
  active_bookings: number
  total_revenue: number
  total_lots: number
  total_slots: number
  available_slots: number
  occupancy_rate: number
}
