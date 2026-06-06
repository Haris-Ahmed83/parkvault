"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import StatusBadge from "@/components/shared/StatusBadge"
import { CalendarCheck, QrCode, XCircle } from "lucide-react"
import { formatDate, formatTime, formatCurrency } from "@/lib/utils"
import { QRCodeSVG } from "qrcode.react"
import type { Booking } from "@/types"

export default function MyBookingsPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState<string | null>(null)

  useEffect(() => {
    if (userId) loadBookings()
  }, [userId])

  async function loadBookings() {
    if (!userId) return
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (data) setBookings(data)
    setLoading(false)
  }

  async function handleCancel(id: string) {
    if (confirm("Cancel this booking?")) {
      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", id)
      loadBookings()
    }
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
          My Bookings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track your parking reservations
        </p>
      </div>

      {showQR && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Your QR Code
            </p>
            <div className="inline-block p-4 bg-white rounded-2xl">
              <QRCodeSVG value={showQR} size={180} />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Show this QR at the gate for entry/exit
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setShowQR(null)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <CalendarCheck
            size={48}
            className="mx-auto mb-4 text-gray-300"
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No bookings yet
          </h3>
          <p className="text-gray-500">
            Book your first parking slot
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Vehicle: {b.vehicle_no}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(b.start_time)} at{" "}
                      {formatTime(b.start_time)}
                    </p>
                    {b.end_time && (
                      <p className="text-sm text-gray-500">
                        End: {formatDate(b.end_time)} at{" "}
                        {formatTime(b.end_time)}
                      </p>
                    )}
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(b.fee)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setShowQR(
                          `parkvault-booking-${b.id}`
                        )
                      }
                    >
                      <QrCode size={14} /> QR
                    </Button>
                    {b.status === "active" && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancel(b.id)}
                      >
                        <XCircle size={14} /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
