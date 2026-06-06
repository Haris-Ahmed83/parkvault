"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatsCard from "@/components/shared/StatsCard"
import StatusBadge from "@/components/shared/StatusBadge"
import { Car, QrCode, Clock, ArrowUpDown, LogIn } from "lucide-react"
import { useSession } from "next-auth/react"
import { formatDate, formatTime, formatCurrency } from "@/lib/utils"
import type { ParkingLot, Booking } from "@/types"

export default function GatekeeperDashboard() {
  const { data: session } = useSession()
  const [lot, setLot] = useState<ParkingLot | null>(null)
  const [todayLogs, setTodayLogs] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) return

      const { data: assignment } = await supabase
        .from("gatekeeper_assignments")
        .select("lot_id")
        .eq("user_id", session.user.id)
        .single()

      if (!assignment) {
        setLoading(false)
        return
      }

      const [lotRes, bookingsRes] = await Promise.all([
        supabase
          .from("parking_lots")
          .select("*")
          .eq("id", assignment.lot_id)
          .single(),
        supabase
          .from("bookings")
          .select("*")
          .eq("lot_id", assignment.lot_id)
          .gte(
            "created_at",
            new Date().toISOString().split("T")[0]
          )
          .order("created_at", { ascending: false }),
      ])

      if (lotRes.data) setLot(lotRes.data)
      if (bookingsRes.data) setTodayLogs(bookingsRes.data)
      setLoading(false)
    }
    loadData()
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!lot) {
    return (
      <div className="text-center py-16">
        <Car size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Lot Assigned
        </h2>
        <p className="text-gray-500">
          Contact admin to get assigned to a parking lot.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gatekeeper Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {lot.name} — {lot.address}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Slots"
          value={lot.total_slots}
          icon={<Car size={18} />}
        />
        <StatsCard
          title="Available"
          value={lot.available_slots}
          icon={<LogIn size={18} />}
        />
        <StatsCard
          title="Occupied"
          value={lot.total_slots - lot.available_slots}
          icon={<Clock size={18} />}
        />
        <StatsCard
          title="Today's Entries"
          value={todayLogs.length}
          icon={<ArrowUpDown size={18} />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {todayLogs.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No activity today
            </p>
          ) : (
            <div className="space-y-3">
              {todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                      <Car size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.vehicle_no}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(log.created_at)} {formatTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={log.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
