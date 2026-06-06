import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    let query = supabaseAdmin
      .from("subscriptions")
      .select("*, parking_lots(name)")

    if (user_id) {
      query = query.eq("user_id", user_id)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ subscriptions: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user_id, lot_id, end_date, fee, start_date } = await request.json()

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id,
        lot_id,
        end_date,
        fee,
        start_date: start_date || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ subscription: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
