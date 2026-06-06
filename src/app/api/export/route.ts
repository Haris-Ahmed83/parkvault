import { NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || !["bookings", "revenue", "transactions"].includes(type)) {
      return new Response("Invalid export type", { status: 400 })
    }

    if (type === "bookings") {
      const { data, error } = await supabaseAdmin
        .from("bookings")
        .select("id, vehicle_no, lot_id, start_time, end_time, status, fee")
        .order("created_at", { ascending: false })

      if (error) {
        return new Response(error.message, { status: 400 })
      }

      const header = "id,vehicle_no,lot_id,start_time,end_time,status,fee"
      const rows = data.map((r) =>
        `${r.id},${r.vehicle_no},${r.lot_id},${r.start_time},${r.end_time},${r.status},${r.fee}`
      )
      const csv = [header, ...rows].join("\n")

      return new Response(csv, {
        headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=bookings.csv" },
      })
    }

    if (type === "revenue") {
      const { data: all, error: err } = await supabaseAdmin
        .from("bookings")
        .select("fee, status")

      if (err) {
        return new Response(err.message, { status: 400 })
      }

      const totalRevenue = all.reduce((sum, b) => sum + (b.fee || 0), 0)
      const totalBookings = all.length
      const byStatus = all.reduce((acc: Record<string, number>, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1
        return acc
      }, {})

      const header = "metric,value"
      const rows = [
        `total_revenue,${totalRevenue}`,
        `total_bookings,${totalBookings}`,
        ...Object.entries(byStatus).map(([k, v]) => `status_${k},${v}`),
      ]
      const csv = [header, ...rows].join("\n")

      return new Response(csv, {
        headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=revenue.csv" },
      })
    }

    if (type === "transactions") {
      const { data, error } = await supabaseAdmin
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        return new Response(error.message, { status: 400 })
      }

      const keys = data.length > 0 ? Object.keys(data[0]) : []
      const header = keys.join(",")
      const rows = data.map((r) => keys.map((k) => r[k] ?? "").join(","))
      const csv = [header, ...rows].join("\n")

      return new Response(csv, {
        headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=transactions.csv" },
      })
    }
  } catch (error) {
    return new Response("Internal server error", { status: 500 })
  }
}
