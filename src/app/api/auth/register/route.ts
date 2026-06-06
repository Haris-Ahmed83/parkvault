import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { name, email, phone, vehicle_no, password } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        name,
        email,
        phone: phone || null,
        vehicle_no: vehicle_no || null,
        password: password || Math.random().toString(36).slice(2, 10),
        role: "user",
        wallet_balance: 0,
      })
      .select("id, name, email, role")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
