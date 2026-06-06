"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Badge from "@/components/ui/badge"
import { Clock, Plus, Trash2, Percent } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { PricingRule, ParkingLot } from "@/types"

interface PricingRuleRow extends PricingRule {
  created_at?: string
}

const dayLabels: Record<string, string> = {
  "": "All",
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
}

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRuleRow[]>([])
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    lot_id: "",
    name: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    multiplier: "1.5",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [rulesRes, lotsRes] = await Promise.all([
        fetch("/api/pricing-rules"),
        fetch("/api/parking-lots"),
      ])
      const rulesData = await rulesRes.json()
      const lotsData = await lotsRes.json()
      if (rulesData.rules) setRules(rulesData.rules)
      if (lotsData.lots) setLots(lotsData.lots)
    } catch (err) {
      console.error("Load error:", err)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const payload = {
      lot_id: form.lot_id,
      name: form.name,
      day_of_week: form.day_of_week === "" ? null : parseInt(form.day_of_week),
      start_time: form.start_time,
      end_time: form.end_time,
      multiplier: parseFloat(form.multiplier),
      is_active: true,
    }

    const res = await fetch("/api/pricing-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Failed to create rule")
      return
    }

    setShowForm(false)
    setForm({ lot_id: "", name: "", day_of_week: "", start_time: "", end_time: "", multiplier: "1.5" })
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this pricing rule?")) return
    await supabase.from("pricing_rules").delete().eq("id", id)
    loadData()
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing Rules</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage dynamic pricing rules</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Add Rule
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Pricing Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Parking Lot</label>
                <select
                  value={form.lot_id}
                  onChange={(e) => setForm({ ...form, lot_id: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select a lot</option>
                  {lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>{lot.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Rule Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Weekend Surge"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Day of Week</label>
                <select
                  value={form.day_of_week}
                  onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  {Object.entries(dayLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Multiplier</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.multiplier}
                  onChange={(e) => setForm({ ...form, multiplier: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">Create Rule</Button>
              </div>
            </form>
            {error && (
              <p className="text-sm text-red-500 mt-3 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2">{error}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Pricing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Lot</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Rule</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Day</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Time Range</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Multiplier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Created</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => {
                  const lot = lots.find((l) => l.id === rule.lot_id)
                  return (
                    <tr
                      key={rule.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{lot?.name || "Unknown"}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{rule.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {rule.day_of_week !== null ? dayLabels[String(rule.day_of_week)] : "All"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} />
                          {rule.start_time} - {rule.end_time}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                          <Percent size={14} />×{rule.multiplier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={rule.is_active ? "active" : "inactive"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {rule.created_at ? formatDate(rule.created_at) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="danger" size="sm" onClick={() => handleDelete(rule.id)}>
                          <Trash2 size={14} /> Delete
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {rules.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Clock size={40} className="mx-auto mb-3 opacity-50" />
                <p>No pricing rules yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
