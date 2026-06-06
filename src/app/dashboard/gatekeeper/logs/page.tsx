"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatusBadge from "@/components/shared/StatusBadge"
import { ClipboardList } from "lucide-react"
import { formatDate, formatTime, formatCurrency } from "@/lib/utils"
import type { Booking } from "@/types"

export default function GatekeeperLogsPage() {
  const [logs, setLogs] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .gte("created_at", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: false })
    if (data) setLogs(data)
    setLoading(false)
  }

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
          Today&apos;s Log
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          All entries and exits today
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Fee
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {log.vehicle_no}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatDate(log.created_at)}{" "}
                      {formatTime(log.created_at)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(log.fee)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-gray-400"
                    >
                      No activity today
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
