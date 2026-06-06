"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import StatsCard from "@/components/shared/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import StatusBadge from "@/components/shared/StatusBadge"
import { CalendarCheck, MapPin, Clock, Wallet, CreditCard, Plus } from "lucide-react"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import type { Booking } from "@/types"
import Link from "next/link"

export default function UserDashboard() {
  const { data: session } = useSession()
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [walletBalance, setWalletBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return
    async function loadData() {

      const { data: userData } = await supabase
        .from("users")
        .select("wallet_balance")
        .eq("id", userId)
        .single()

      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (bookings) {
        setActiveBooking(
          bookings.find((b) => b.status === "active") || null
        )
        setRecentBookings(bookings)
      }
      if (userData) setWalletBalance(userData.wallet_balance)
      setLoading(false)
    }
    if (session?.user?.id) loadData()
  }, [session?.user?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your parking
          </p>
        </div>
        <Link href="/dashboard/user/find-parking">
          <Button>
            <Plus size={16} />
            Book a Slot
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Wallet Balance"
          value={formatCurrency(walletBalance)}
          icon={<Wallet size={18} />}
        />
        <StatsCard
          title="Active Booking"
          value={activeBooking ? "1" : "0"}
          icon={<Clock size={18} />}
        />
        <StatsCard
          title="Total Bookings"
          value={recentBookings.length}
          icon={<CalendarCheck size={18} />}
        />
        <StatsCard
          title="Total Spent"
          value={formatCurrency(
            recentBookings
              .filter((b) => b.status === "completed")
              .reduce((s, b) => s + b.fee, 0)
          )}
          icon={<CreditCard size={18} />}
        />
      </div>

      {activeBooking && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Active Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Slot: {activeBooking.vehicle_no}</p>
                <p className="text-sm text-gray-500">
                  Since: {formatDate(activeBooking.start_time)} at{" "}
                  {formatTime(activeBooking.start_time)}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(activeBooking.fee)}
                </p>
              </div>
              <Link href="/dashboard/user/my-bookings">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MapPin size={40} className="mx-auto mb-3 opacity-50" />
              <p>No bookings yet</p>
              <Link href="/dashboard/user/find-parking">
                <Button variant="outline" className="mt-3">
                  Book Your First Slot
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Booking #{b.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(b.created_at)} -{" "}
                      {formatCurrency(b.fee)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
