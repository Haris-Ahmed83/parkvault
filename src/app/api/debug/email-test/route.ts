import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { to } = await req.json()
  if (!to) return NextResponse.json({ error: "Missing 'to' email" }, { status: 400 })

  const results: any = { to, timestamp: new Date().toISOString() }

  const brevoKey = process.env.BREVO_API_KEY
  const resendKey = process.env.RESEND_API_KEY
  const smtpUser = process.env.SMTP_USER

  results.env = {
    hasBrevo: !!brevoKey,
    brevoKeyPrefix: brevoKey ? brevoKey.slice(0, 12) + "..." : null,
    hasResend: !!resendKey,
    resendKeyPrefix: resendKey ? resendKey.slice(0, 10) + "..." : null,
    hasSMTP: !!smtpUser,
    smtpUser: smtpUser || null,
  }

  if (brevoKey) {
    try {
      const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: "ParkVault", email: "noreply@parkvault.app" },
          to: [{ email: to }],
          subject: "ParkVault Brevo Test",
          htmlContent: "<p>Test from Brevo</p>",
        }),
      })
      const result = await resp.json()
      results.brevo = { success: resp.ok, status: resp.status, result }
    } catch (err: any) {
      results.brevo = { success: false, error: err.message }
    }
  } else {
    results.brevo = { skipped: "BREVO_API_KEY not configured" }
  }

  if (resendKey) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [to],
          subject: "ParkVault Resend Test",
          html: "<p>Test from Resend</p>",
        }),
      })
      const result = await resp.json()
      results.resend = { success: resp.ok, status: resp.status, result }
    } catch (err: any) {
      results.resend = { success: false, error: err.message }
    }
  } else {
    results.resend = { skipped: "RESEND_API_KEY not configured" }
  }

  return NextResponse.json(results)
}
