"use client"

import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import QRScanner from "@/components/shared/QRScanner"
import { Scan, CheckCircle, XCircle, Camera } from "lucide-react"

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [scanStatus, setScanStatus] = useState<
    "idle" | "success" | "error"
  >("idle")
  const [qrInput, setQrInput] = useState("")
  const [lots, setLots] = useState<{ id: string; name: string; address: string; available_slots: number; total_slots: number; hourly_rate: number }[]>([])
  const [showScanner, setShowScanner] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase
      .from("parking_lots")
      .select("id, name, address, available_slots, total_slots, hourly_rate")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setLots(data)
      })
  }, [])

  async function handleVerify(input: string) {
    if (!input) return
    const bookingId = input.replace("parkvault-booking-", "")
    await processBooking(bookingId)
    setQrInput("")
  }

  async function handleScan() {
    if (!qrInput) return
    const bookingId = qrInput.replace("parkvault-booking-", "")
    await processBooking(bookingId)
    setQrInput("")
  }

  async function processBooking(bookingId: string) {

    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single()

    if (!booking) {
      setScanStatus("error")
      setScanResult("Invalid QR code")
      return
    }

    if (booking.status === "active") {
      await supabase
        .from("bookings")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
        })
        .eq("id", bookingId)

      const { data: lot } = await supabase
        .from("parking_lots")
        .select("available_slots")
        .eq("id", booking.lot_id)
        .single()

      await supabase
        .from("parking_lots")
        .update({
          available_slots: (lot?.available_slots || 0) + 1,
        })
        .eq("id", booking.lot_id)

      setScanStatus("success")
      setScanResult(
        `Check-out successful! Vehicle: ${booking.vehicle_no}, Fee: PKR ${booking.fee}`
      )
    } else if (booking.status === "pending") {
      await supabase
        .from("bookings")
        .update({ status: "active" })
        .eq("id", bookingId)

      setScanStatus("success")
      setScanResult(
        `Check-in successful! Vehicle: ${booking.vehicle_no}`
      )
    } else {
      setScanStatus("error")
      setScanResult(
        `Booking is already ${booking.status}`
      )
    }

    setQrInput("")
  }

  async function handleManualCheckIn(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const vehicleNo = formData.get("vehicle_no") as string
    const lotId = formData.get("lot_id") as string

    if (!vehicleNo || !lotId) return

    const { data: lot } = await supabase
      .from("parking_lots")
      .select("available_slots, hourly_rate")
      .eq("id", lotId)
      .single()

    await supabase.from("bookings").insert({
      vehicle_no: vehicleNo,
      lot_id: lotId,
      status: "active",
      start_time: new Date().toISOString(),
      fee: lot?.hourly_rate || 0,
      qr_code: `PKV-${Date.now()}`,
    })

    await supabase
      .from("parking_lots")
      .update({ available_slots: Math.max(0, (lot?.available_slots || 0) - 1) })
      .eq("id", lotId)

    setScanStatus("success")
    setScanResult(`Walk-in vehicle ${vehicleNo} checked in`)
    form.reset()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Scan QR Code
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Scan QR for entry/exit
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Paste QR code or scan..."
              className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button onClick={() => setShowScanner(true)}>
              <Camera size={16} />
              Scan
            </Button>
            <Button onClick={handleScan}>
              <Scan size={16} />
              Verify
            </Button>
          </div>

          {showScanner && (
            <QRScanner
              onScan={(data) => {
                setQrInput(data)
                setShowScanner(false)
                inputRef.current?.focus()
                handleVerify(data)
              }}
              onClose={() => setShowScanner(false)}
            />
          )}

          {scanStatus !== "idle" && (
            <div
              className={`p-4 rounded-xl flex items-start gap-3 ${
                scanStatus === "success"
                  ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
              }`}
            >
              {scanStatus === "success" ? (
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{scanResult}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Check-in (Walk-in)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualCheckIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Vehicle Number
              </label>
              <input
                name="vehicle_no"
                placeholder="ABC-123"
                required
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Parking Lot
              </label>
              <select
                name="lot_id"
                required
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a lot...</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name} - {lot.available_slots}/{lot.total_slots} slots - {lot.hourly_rate} PKR/hr
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">
              <Camera size={16} />
              Check In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
