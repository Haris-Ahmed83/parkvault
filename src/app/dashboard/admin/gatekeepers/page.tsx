"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import StatusBadge from "@/components/shared/StatusBadge"
import { Plus, ShieldCheck, Building2, Trash2 } from "lucide-react"
import type { User, ParkingLot, GatekeeperAssignment } from "@/types"

export default function AdminGatekeepersPage() {
  const [gatekeepers, setGatekeepers] = useState<User[]>([])
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [assignments, setAssignments] = useState<GatekeeperAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    lot_id: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [gkRes, lotsRes, assignRes] = await Promise.all([
      supabase.from("users").select("*").eq("role", "gatekeeper"),
      supabase.from("parking_lots").select("*").eq("is_active", true),
      supabase.from("gatekeeper_assignments").select("*"),
    ])
    if (gkRes.data) setGatekeepers(gkRes.data)
    if (lotsRes.data) setLots(lotsRes.data)
    if (assignRes.data) setAssignments(assignRes.data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "gatekeeper",
        wallet_balance: 0,
      })
      .select()
      .single()

    if (error) return

    if (form.lot_id && newUser) {
      await supabase.from("gatekeeper_assignments").insert({
        user_id: newUser.id,
        lot_id: form.lot_id,
      })
    }

    setShowForm(false)
    setForm({ name: "", email: "", password: "", lot_id: "" })
    loadData()
  }

  async function handleDelete(id: string) {
    if (confirm("Remove this gatekeeper?")) {
      await supabase.from("users").delete().eq("id", id)
      await supabase
        .from("gatekeeper_assignments")
        .delete()
        .eq("user_id", id)
      loadData()
    }
  }

  function getAssignedLot(userId: string) {
    const assign = assignments.find((a) => a.user_id === userId)
    if (!assign) return "Not assigned"
    const lot = lots.find((l) => l.id === assign.lot_id)
    return lot?.name || "Unknown"
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gatekeepers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage gatekeepers and their assignments
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Add Gatekeeper
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Gatekeeper</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Assign Lot
                </label>
                <select
                  value={form.lot_id}
                  onChange={(e) =>
                    setForm({ ...form, lot_id: e.target.value })
                  }
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select lot</option>
                  {lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Create Gatekeeper
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Assigned Lot
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {gatekeepers.map((gk) => (
                  <tr
                    key={gk.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {gk.name}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{gk.email}</td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={
                          assignments.find(
                            (a) => a.user_id === gk.id
                          )
                            ? getAssignedLot(gk.id)
                            : "Not assigned"
                        }
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(gk.id)}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
