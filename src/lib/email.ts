import nodemailer from "nodemailer"

const APP_NAME = "ParkVault"
type EmailResult = { success: true; id?: string } | { error: string }

const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
let transporter: nodemailer.Transporter | null = null
if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: smtpUser, pass: smtpPass },
  })
}

async function sendViaSMTP(to: string, subject: string, html: string, text?: string): Promise<EmailResult> {
  if (!transporter) return { error: "SMTP not configured" }
  try {
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${smtpUser}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    })
    console.log("SMTP success:", info.messageId)
    return { success: true, id: info.messageId }
  } catch (err: any) {
    console.error("SMTP error:", err)
    return { error: `SMTP: ${err.message}` }
  }
}

async function sendViaResend(to: string, subject: string, html: string, text?: string): Promise<EmailResult> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { error: "RESEND_API_KEY not configured" }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "onboarding@resend.dev",
        to: [to],
        subject, html,
        text: text || html.replace(/<[^>]*>/g, ""),
      }),
    })
    const result = await resp.json()
    if (!resp.ok) {
      console.error("Resend error:", resp.status, result)
      return { error: `Resend (${resp.status}): ${result.message || JSON.stringify(result)}` }
    }
    console.log("Resend success:", result.id)
    return { success: true, id: result.id }
  } catch (err: any) {
    console.error("Resend exception:", err)
    return { error: `Resend: ${err.message}` }
  }
}

async function sendViaBrevo(to: string, subject: string, html: string, text?: string): Promise<EmailResult> {
  const key = process.env.BREVO_API_KEY
  if (!key) return { error: "BREVO_API_KEY not configured" }
  try {
    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: APP_NAME, email: process.env.BREVO_FROM || "noreply@parkvault.app" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text || html.replace(/<[^>]*>/g, ""),
      }),
    })
    const result = await resp.json()
    if (!resp.ok) {
      console.error("Brevo error:", resp.status, result)
      return { error: `Brevo (${resp.status}): ${result.message || JSON.stringify(result)}` }
    }
    console.log("Brevo success:", result.messageId)
    return { success: true, id: result.messageId }
  } catch (err: any) {
    console.error("Brevo exception:", err)
    return { error: `Brevo: ${err.message}` }
  }
}

async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailResult> {
  let r: EmailResult

  r = await sendViaSMTP(to, subject, html, text)
  if ("success" in r) return r

  r = await sendViaResend(to, subject, html, text)
  if ("success" in r) return r

  r = await sendViaBrevo(to, subject, html, text)
  if ("success" in r) return r

  return { error: "All providers failed" }
}

export async function sendOTP(email: string, otp: string) {
  console.log(`sendOTP called: to=${email}`)
  return sendEmail(
    email,
    `Your ${APP_NAME} OTP Code: ${otp}`,
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">${APP_NAME}</h1>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px">
        <h2 style="margin:0 0 8px">Your OTP Code</h2>
        <p style="color:#6b7280;margin:0 0 16px">Use this code to log in to your account.</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;text-align:center;font-size:36px;font-weight:700;letter-spacing:8px;color:#1f2937">${otp}</div>
        <p style="color:#9ca3af;font-size:12px;margin-top:16px">This code expires in 10 minutes.</p>
      </div>
    </div>`,
    `Your OTP Code: ${otp}. Use this to log in to ${APP_NAME}. Expires in 10 minutes.`,
  )
}

export async function sendBookingConfirmation(email: string, name: string, details: {
  lotName: string; vehicleNo: string; startTime: string; endTime: string; fee: number; qrCode: string
}) {
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:24px;border-radius:12px 12px 0 0;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:20px">${APP_NAME}</h1>
    </div>
    <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px">
      <h2 style="margin:0 0 4px">Booking Confirmed</h2>
      <p style="color:#6b7280;margin:0 0 16px">Hi ${name}, your parking has been reserved.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280">Location</td><td style="padding:8px 0;font-weight:600">${details.lotName}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Vehicle</td><td style="padding:8px 0;font-weight:600">${details.vehicleNo}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Start</td><td style="padding:8px 0;font-weight:600">${details.startTime}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">End</td><td style="padding:8px 0;font-weight:600">${details.endTime}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Fee</td><td style="padding:8px 0;font-weight:600">PKR ${details.fee}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">QR</td><td style="padding:8px 0;font-family:monospace;font-size:12px">${details.qrCode}</td></tr>
      </table>
    </div>
  </div>`
  const text = `Booking Confirmed\n\nHi ${name}, your parking has been reserved.\nLocation: ${details.lotName}\nVehicle: ${details.vehicleNo}\nStart: ${details.startTime}\nEnd: ${details.endTime}\nFee: PKR ${details.fee}\nQR: ${details.qrCode}`
  return sendEmail(email, `Booking Confirmed - ${APP_NAME}`, html, text)
}
