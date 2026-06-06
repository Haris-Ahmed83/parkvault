"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Badge from "@/components/ui/badge"
import { Calendar, Clock, Plus, ShieldCheck, Trash2 } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { StaffShift, User, ParkingLot } from "@/types"

export default function AdminShiftsPage() {
  const [shifts, setShifts] = useState<StaffShift[]>([])
  const [gatekeepers, setGatekeepers] = useState<User[]>([])
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    user_id: "",
    lot_id: "",
    start_time: "",
    end_time: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [shiftsRes, usersRes, lotsRes] = await Promise.all([
      fetch("/api/staff-shifts").then((r) => r.json()),
      fetch("/api/users?role=gatekeeper").then((r) => r.json()),
      fetch("/api/parking-lots").then((r) => r.json()),
    ])
    if (shiftsRes.data) setShifts(shiftsRes.data)
    if (usersRes.data) setGatekeepers(usersRes.data)
    if (lotsRes.data) setLots(lotsRes.data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/staff-shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) return
    setShowForm(false)
    setForm({ user_id: "", lot_id: "", start_time: "", end_time: "" })
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this shift?")) return
    await supabase.from("staff_shifts").delete().eq("id", id)
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Staff Shifts
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage gatekeeper shift schedules
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Add Shift
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Gatekeeper
                </label>
                <select
                  value={form.user_id}
                  onChange={(e) =>
                    setForm({ ...form, user_id: e.target.value })
                  }
                  required
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select gatekeeper</option>
                  {gatekeepers.map((gk) => (
                    <option key={gk.id} value={gk.id}>
                      {gk.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Parking Lot
                </label>
                <select
                  value={form.lot_id}
                  onChange={(e) =>
                    setForm({ ...form, lot_id: e.target.value })
                  }
                  required
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Time
                </label>
                <Input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Time
                </label>
                <Input
                  type="datetime-local"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm({ ...form, end_time: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <ShieldCheck size={16} />
                  Create Shift
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
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} />
                      Gatekeeper
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Parking Lot
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      Start
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      End
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr
                    key={shift.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                          <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        {shift.user_name || "Unknown"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {shift.lot_name || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatDateTime(shift.start_time)}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatDateTime(shift.end_time)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={shift.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(shift.id)}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-gray-400"
                    >
                      <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No shifts scheduled</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
