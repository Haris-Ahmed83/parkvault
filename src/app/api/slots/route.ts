import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lot_id = searchParams.get("lot_id")

    let query = supabaseAdmin
      .from("slots")
      .select("*, parking_lots(name)")

    if (lot_id) {
      query = query.eq("lot_id", lot_id)
    }

    const { data, error } = await query.order("slot_number", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ slots: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { lot_id, slots } = await request.json()

    const { data, error } = await supabaseAdmin
      .from("slots")
      .insert(slots.map((slot: any) => ({ ...slot, lot_id })))
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ slots: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
