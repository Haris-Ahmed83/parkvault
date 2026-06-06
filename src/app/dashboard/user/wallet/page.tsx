"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import StatsCard from "@/components/shared/StatsCard"
import { Wallet, Plus, ArrowUpRight, CreditCard } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction } from "@/types"

export default function WalletPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [topUpAmount, setTopUpAmount] = useState(500)
  const [showTopUp, setShowTopUp] = useState(false)

  useEffect(() => {
    if (userId) loadWallet()
  }, [userId])

  async function loadWallet() {
    if (!userId) return
    const { data: user } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", userId)
      .single()

    const { data: txn } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)

    if (user) setBalance(user.wallet_balance)
    if (txn) setTransactions(txn)
    setLoading(false)
  }

  async function handleTopUp() {
    if (!userId) return
    const newBalance = balance + topUpAmount
    await supabase
      .from("users")
      .update({ wallet_balance: newBalance })
      .eq("id", userId)

    await supabase.from("transactions").insert({
      user_id: userId,
      amount: topUpAmount,
      type: "credit",
      description: "Wallet top-up",
    })

    setBalance(newBalance)
    setShowTopUp(false)
    loadWallet()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Wallet
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your balance
        </p>
      </div>

      <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Wallet size={24} className="opacity-80" />
            <CreditCard size={24} className="opacity-80" />
          </div>
          <p className="text-sm text-indigo-200 mb-1">Balance</p>
          <p className="text-3xl font-bold mb-4">
            {formatCurrency(balance)}
          </p>
          <Button
            onClick={() => setShowTopUp(!showTopUp)}
            className="bg-white/20 text-white hover:bg-white/30 border-0"
          >
            <Plus size={16} />
            Add Funds
          </Button>
        </CardContent>
      </Card>

      {showTopUp && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Add Funds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {[500, 1000, 2000, 5000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    topUpAmount === amount
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  +{formatCurrency(amount)}
                </button>
              ))}
            </div>
            <Input
              type="number"
              value={topUpAmount}
              onChange={(e) =>
                setTopUpAmount(parseInt(e.target.value) || 0)
              }
            />
            <Button onClick={handleTopUp} className="w-full">
              Add {formatCurrency(topUpAmount)}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 py-4">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        txn.type === "credit"
                          ? "bg-green-50 dark:bg-green-950/30 text-green-600"
                          : "bg-red-50 dark:bg-red-950/30 text-red-600"
                      }`}
                    >
                      <ArrowUpRight
                        size={16}
                        className={
                          txn.type === "credit"
                            ? "rotate-180"
                            : ""
                        }
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {txn.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(txn.created_at)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      txn.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {txn.type === "credit" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
