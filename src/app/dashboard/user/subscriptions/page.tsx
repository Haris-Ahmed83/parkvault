"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import StatsCard from "@/components/shared/StatsCard"
import StatusBadge from "@/components/shared/StatusBadge"
import { CalendarCheck, CreditCard, Ticket } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Subscription, ParkingLot } from "@/types"

const DURATIONS = [
  { value: 1, label: "1 Month" },
  { value: 3, label: "3 Months" },
  { value: 6, label: "6 Months" },
] as const

export default function SubscriptionsPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedLotId, setSelectedLotId] = useState("")
  const [duration, setDuration] = useState(1)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const selectedLot = lots.find((l) => l.id === selectedLotId)
  const oneMonthFee = selectedLot ? 30 * Number(selectedLot.hourly_rate) * 8 : 0
  const calculatedFee = oneMonthFee * duration

  useEffect(() => {
    if (!userId) return
    loadData()
  }, [userId])

  async function loadData() {
    if (!userId) return

    const [subRes, lotRes] = await Promise.all([
      fetch(`/api/subscriptions?user_id=${userId}`),
      supabase.from("parking_lots").select("*").eq("is_active", true),
    ])

    const subData = await subRes.json()
    if (subData.subscriptions) {
      const mapped: Subscription[] = subData.subscriptions.map((s: any) => ({
        ...s,
        lot_name: s.parking_lots?.name,
      }))
      setSubscriptions(mapped)
    }

    if (lotRes.data) setLots(lotRes.data)
    setLoading(false)
  }

  async function handlePurchase() {
    if (!userId || !selectedLotId || !selectedLot) return
    setPurchasing(true)
    setError("")
    setSuccess("")

    const { data: user } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", userId)
      .single()

    if (!user || user.wallet_balance < calculatedFee) {
      setError("Insufficient wallet balance. Please top up.")
      setPurchasing(false)
      return
    }

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + duration)

    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        lot_id: selectedLotId,
        fee: calculatedFee,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      }),
    })

    if (!res.ok) {
      const errData = await res.json()
      setError(errData.error || "Failed to create subscription")
      setPurchasing(false)
      return
    }

    await supabase
      .from("users")
      .update({ wallet_balance: user.wallet_balance - calculatedFee })
      .eq("id", userId)

    await supabase.from("transactions").insert({
      user_id: userId,
      amount: calculatedFee,
      type: "debit",
      description: `Subscription: ${selectedLot.name} (${duration} month${duration > 1 ? "s" : ""})`,
    })

    setSuccess("Subscription purchased successfully!")
    setSelectedLotId("")
    setDuration(1)
    loadData()
    setPurchasing(false)
  }

  const activeSub = subscriptions.find((s) => s.status === "active")

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
          My Subscriptions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your monthly parking subscriptions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Active Subscriptions"
          value={activeSub ? "1" : "0"}
          icon={<CalendarCheck size={18} />}
        />
        <StatsCard
          title="Total Subscriptions"
          value={subscriptions.length}
          icon={<Ticket size={18} />}
        />
        <StatsCard
          title="Total Spent"
          value={formatCurrency(
            subscriptions.reduce((s, sub) => s + sub.fee, 0)
          )}
          icon={<CreditCard size={18} />}
        />
      </div>

      {activeSub && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Active Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {activeSub.lot_name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(activeSub.start_date)} - {formatDate(activeSub.end_date)}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(activeSub.fee)}
                </p>
              </div>
              <StatusBadge status={activeSub.status} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Purchase New Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Parking Lot</label>
            <select
              value={selectedLotId}
              onChange={(e) => { setSelectedLotId(e.target.value); setError("") }}
              className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a lot</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.name} - {formatCurrency(Number(lot.hourly_rate))}/hr
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    duration === d.value
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {selectedLot && (
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hourly Rate</span>
                <span className="font-medium">{formatCurrency(Number(selectedLot.hourly_rate))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Daily Estimate (8 hrs)</span>
                <span className="font-medium">{formatCurrency(Number(selectedLot.hourly_rate) * 8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monthly Estimate (30 days)</span>
                <span className="font-medium">{formatCurrency(oneMonthFee)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold">
                <span>Total ({duration} month{duration > 1 ? "s" : ""})</span>
                <span className="text-indigo-600">{formatCurrency(calculatedFee)}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950/30 rounded-xl px-4 py-2">{success}</p>
          )}

          <Button
            onClick={handlePurchase}
            disabled={!selectedLotId || purchasing}
            className="w-full"
          >
            {purchasing ? "Processing..." : `Purchase for ${formatCurrency(calculatedFee)}`}
          </Button>
        </CardContent>
      </Card>

      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {sub.lot_name || "Unknown Lot"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(sub.start_date)} - {formatDate(sub.end_date)} | {formatCurrency(sub.fee)}
                    </p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
