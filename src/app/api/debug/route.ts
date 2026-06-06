import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const [usersRes, lotsRes, tablesRes] = await Promise.all([
      supabaseAdmin.from("users").select("id, name, email, role").limit(10),
      supabaseAdmin.from("parking_lots").select("*").limit(5),
      supabaseAdmin.rpc("get_schema_info" as any),
    ])

    return NextResponse.json({
      supabaseUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").slice(0, 40),
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      users: usersRes.data || [],
      userError: usersRes.error?.message || null,
      lots: lotsRes.data || [],
      lotsError: lotsRes.error?.message || null,
      schemaError: tablesRes.error?.message || null,
    })
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      message: err.message,
      stack: err.stack,
    })
  }
}
