"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import StatsCard from "@/components/shared/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Building2,
  Users,
  Car,
  DollarSign,
  CalendarCheck,
  MapPin,
} from "lucide-react"
import type { DashboardStats, Booking } from "@/types"
import StatusBadge from "@/components/shared/StatusBadge"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_bookings: 0,
    active_bookings: 0,
    total_revenue: 0,
    total_lots: 0,
    total_slots: 0,
    available_slots: 0,
    occupancy_rate: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [usersRes, bookingsRes, lotsRes] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("parking_lots").select("*"),
      ])

      const bookings = bookingsRes.data || []
      const lots = lotsRes.data || []
      const totalSlots = lots.reduce(
        (sum, l) => sum + (l.total_slots || 0),
        0
      )
      const availableSlots = lots.reduce(
        (sum, l) => sum + (l.available_slots || 0),
        0
      )
      const activeBookings = bookings.filter(
        (b) => b.status === "active"
      ).length
      const revenue = bookings
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + (b.fee || 0), 0)

      setStats({
        total_users: usersRes.count || 0,
        total_bookings: bookings.length,
        active_bookings: activeBookings,
        total_revenue: revenue,
        total_lots: lots.length,
        total_slots: totalSlots,
        available_slots: availableSlots,
        occupancy_rate:
          totalSlots > 0
            ? Math.round(
                ((totalSlots - availableSlots) / totalSlots) * 100
              )
            : 0,
      })
      setRecentBookings(bookings)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Overview of your parking system
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.total_users}
          icon={<Users size={18} />}
        />
        <StatsCard
          title="Parking Lots"
          value={stats.total_lots}
          icon={<Building2 size={18} />}
        />
        <StatsCard
          title="Active Bookings"
          value={stats.active_bookings}
          icon={<CalendarCheck size={18} />}
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(stats.total_revenue)}
          icon={<DollarSign size={18} />}
        />
        <StatsCard
          title="Total Slots"
          value={stats.total_slots}
          icon={<MapPin size={18} />}
        />
        <StatsCard
          title="Available"
          value={stats.available_slots}
          icon={<Car size={18} />}
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${stats.occupancy_rate}%`}
          icon={<Car size={18} />}
        />
        <StatsCard
          title="Total Bookings"
          value={stats.total_bookings}
          icon={<CalendarCheck size={18} />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">
                    User
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">
                    Fee
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-2 text-gray-900 dark:text-white">
                      {b.vehicle_no}
                    </td>
                    <td className="py-3 px-2 text-gray-500 dark:text-gray-400">
                      {b.vehicle_no}
                    </td>
                    <td className="py-3 px-2 text-gray-500 dark:text-gray-400">
                      {formatDate(b.created_at)}
                    </td>
                    <td className="py-3 px-2 font-medium">
                      {formatCurrency(b.fee)}
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-gray-400"
                    >
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
