import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    const lot_id = searchParams.get("lot_id")

    let query = supabaseAdmin
      .from("staff_shifts")
      .select("*, parking_lots(name)")

    if (user_id) {
      query = query.eq("user_id", user_id)
    }

    if (lot_id) {
      query = query.eq("lot_id", lot_id)
    }

    const { data, error } = await query.order("start_time", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ shifts: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user_id, lot_id, start_time, end_time } = await request.json()

    const { data, error } = await supabaseAdmin
      .from("staff_shifts")
      .insert({ user_id, lot_id, start_time, end_time })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ shift: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
