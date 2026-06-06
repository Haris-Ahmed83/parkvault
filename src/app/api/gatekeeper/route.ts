import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, action } = await request.json()

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single()

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    if (action === "check-in") {
      await supabaseAdmin
        .from("bookings")
        .update({ status: "active" })
        .eq("id", bookingId)

      await supabaseAdmin.rpc("decrement_slots", {
        lot_id: booking.lot_id,
      })
    } else if (action === "check-out") {
      await supabaseAdmin
        .from("bookings")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
        })
        .eq("id", bookingId)

      await supabaseAdmin.rpc("increment_slots", {
        lot_id: booking.lot_id,
      })
    }

    return NextResponse.json({
      success: true,
      booking: { ...booking, status: action === "check-in" ? "active" : "completed" },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
