import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendBookingConfirmation } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId required" }, { status: 400 })
    }

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("*, parking_lots(name), users(name, email)")
      .eq("id", bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const user = booking.users as { name: string; email: string } | null
    const lot = booking.parking_lots as { name: string } | null

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const result = await sendBookingConfirmation(user.email, user.name, {
      lotName: lot?.name || "Unknown",
      vehicleNo: booking.vehicle_no,
      startTime: new Date(booking.start_time).toLocaleString(),
      endTime: new Date(booking.end_time).toLocaleString(),
      fee: Number(booking.fee),
      qrCode: booking.qr_code,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
