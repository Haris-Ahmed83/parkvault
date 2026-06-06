"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatsCard from "@/components/shared/StatsCard"
import { BarChart3, TrendingUp, Clock, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Booking } from "@/types"

export default function AdminAnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
      if (data) setBookings(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const totalRevenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + b.fee, 0)
  const activeCount = bookings.filter((b) => b.status === "active").length
  const avgFee =
    bookings.length > 0
      ? Math.round(
          bookings.reduce((s, b) => s + b.fee, 0) / bookings.length
        )
      : 0

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
          Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Platform performance insights
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign size={18} />}
        />
        <StatsCard
          title="Active Now"
          value={activeCount}
          icon={<Clock size={18} />}
        />
        <StatsCard
          title="Avg. Fee"
          value={formatCurrency(avgFee)}
          icon={<TrendingUp size={18} />}
        />
        <StatsCard
          title="Total Bookings"
          value={bookings.length}
          icon={<BarChart3 size={18} />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["completed", "active", "cancelled"].map((status) => {
                const total = bookings
                  .filter((b) => b.status === status)
                  .reduce((s, b) => s + b.fee, 0)
                const count = bookings.filter(
                  (b) => b.status === status
                ).length
                return (
                  <div
                    key={status}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                      {status}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(total)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {count} bookings
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Completion Rate</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {bookings.length > 0
                    ? Math.round(
                        (bookings.filter((b) => b.status === "completed")
                          .length /
                          bookings.length) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      bookings.length > 0
                        ? (bookings.filter((b) => b.status === "completed")
                            .length /
                            bookings.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Cancellation Rate</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {bookings.length > 0
                    ? Math.round(
                        (bookings.filter((b) => b.status === "cancelled")
                          .length /
                          bookings.length) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      bookings.length > 0
                        ? (bookings.filter((b) => b.status === "cancelled")
                            .length /
                            bookings.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
