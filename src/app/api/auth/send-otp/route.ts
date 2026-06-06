import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendOTP } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json()
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role required" }, { status: 400 })
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role")
      .eq("email", email)
      .single()

    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 })
    }

    if (user.role !== role) {
      return NextResponse.json({ error: "Role mismatch for this account" }, { status: 403 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: insertError } = await supabaseAdmin.from("otp_codes").insert({
      email,
      otp,
      role,
      expires_at: expiresAt,
    })

    if (insertError) {
      return NextResponse.json({ error: `Failed to save OTP: ${insertError.message}` }, { status: 500 })
    }

    const emailResult = await sendOTP(email, otp)
    console.log("sendOTP result:", JSON.stringify(emailResult))

    return NextResponse.json({
      message: "OTP sent to your email",
      dev_otp: process.env.NODE_ENV === "development" ? otp : undefined,
      emailError: "error" in emailResult ? emailResult.error : undefined,
      emailId: "id" in emailResult ? emailResult.id : undefined,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
  }
}
