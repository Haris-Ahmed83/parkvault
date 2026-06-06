import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, type, description } = await request.json()

    if (type === "credit") {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("wallet_balance")
        .eq("id", userId)
        .single()

      const newBalance = (user?.wallet_balance || 0) + amount

      await supabaseAdmin
        .from("users")
        .update({ wallet_balance: newBalance })
        .eq("id", userId)
    } else {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("wallet_balance")
        .eq("id", userId)
        .single()

      if ((user?.wallet_balance || 0) < amount) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        )
      }

      const newBalance = (user?.wallet_balance || 0) - amount

      await supabaseAdmin
        .from("users")
        .update({ wallet_balance: newBalance })
        .eq("id", userId)
    }

    const { data: txn } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        amount,
        type,
        description,
      })
      .select()
      .single()

    return NextResponse.json({ transaction: txn })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
