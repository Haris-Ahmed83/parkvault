"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatusBadge from "@/components/shared/StatusBadge"
import { Search, CalendarCheck } from "lucide-react"
import type { Booking } from "@/types"
import { formatDate, formatTime, formatCurrency } from "@/lib/utils"

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setBookings(data)
    setLoading(false)
  }

  const filtered = bookings.filter(
    (b) =>
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle_no.toLowerCase().includes(search.toLowerCase())
  )

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
          All Bookings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View all booking records
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Vehicle</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Start</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">End</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Fee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-xs">
                      #{b.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {b.vehicle_no}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatDate(b.start_time)}
                      <br />
                      {formatTime(b.start_time)}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {b.end_time
                        ? formatDate(b.end_time)
                        : "-"}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(b.fee)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-gray-400"
                    >
                      No bookings found
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
