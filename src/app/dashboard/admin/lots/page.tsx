"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import StatusBadge from "@/components/shared/StatusBadge"
import ParkingMap from "@/components/maps/ParkingMap"
import { Plus, MapPin, Edit2, Trash2, Building2, Crosshair } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { ParkingLot } from "@/types"

export default function AdminLotsPage() {
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    address: "",
    lat: 31.5204,
    lng: 74.3587,
    total_slots: 20,
    hourly_rate: 50,
    walkin_percentage: 50,
  })

  useEffect(() => {
    loadLots()
  }, [])

  async function loadLots() {
    const { data, error } = await supabase
      .from("parking_lots")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) console.error("Load error:", error)
    if (data) setLots(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const { error } = await supabase.from("parking_lots").insert({
      name: form.name,
      address: form.address,
      lat: form.lat,
      lng: form.lng,
      total_slots: form.total_slots,
      available_slots: form.total_slots,
      hourly_rate: form.hourly_rate,
      walkin_percentage: form.walkin_percentage,
      has_2wheeler: true,
      has_4wheeler: true,
      is_active: true,
    })
    if (error) {
      setError(error.message)
      return
    }
    setShowForm(false)
    setForm({
      name: "",
      address: "",
      lat: 31.5204,
      lng: 74.3587,
      total_slots: 20,
      hourly_rate: 50,
      walkin_percentage: 50,
    })
    loadLots()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this parking lot?")) return
    await supabase.from("parking_lots").delete().eq("id", id)
    if (selectedLotId === id) setSelectedLotId(null)
    loadLots()
  }

  const getCurrentLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({
            ...f,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }))
        },
        () => alert("Could not get location")
      )
    }
  }, [])

  const handleLotClick = useCallback((lot: { id: string }) => {
    setSelectedLotId((prev) => (prev === lot.id ? null : lot.id))
  }, [])

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
            Parking Lots
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your parking locations
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Add Lot
        </Button>
      </div>

      <Card className="overflow-hidden">
        <ParkingMap
          lots={lots.map((l) => ({ ...l, lat: Number(l.lat), lng: Number(l.lng) }))}
          height="350px"
          onLotClick={handleLotClick}
          selectedLotId={selectedLotId}
        />
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Parking Lot</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Mall Road Parking"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Full address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Button type="button" variant="outline" onClick={getCurrentLocation} className="w-full">
                  <Crosshair size={14} /> Use My Location
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Slots</label>
                <Input
                  type="number"
                  value={form.total_slots}
                  onChange={(e) => setForm({ ...form, total_slots: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hourly Rate (PKR)</label>
                <Input
                  type="number"
                  value={form.hourly_rate}
                  onChange={(e) => setForm({ ...form, hourly_rate: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Walk-in %</label>
                <Input
                  type="number"
                  value={form.walkin_percentage}
                  onChange={(e) => setForm({ ...form, walkin_percentage: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">Create Lot</Button>
              </div>
            </form>
            {error && <p className="text-sm text-red-500 mt-3 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lots.map((lot) => (
          <Card key={lot.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                    <Building2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{lot.name}</h3>
                    <p className="text-xs text-gray-400">{lot.address}</p>
                  </div>
                </div>
                <StatusBadge status={lot.is_active ? "active" : "inactive"} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <p className="text-gray-500">
                  Slots: <span className="font-medium text-gray-900 dark:text-white">{lot.available_slots}/{lot.total_slots}</span>
                </p>
                <p className="text-gray-500">
                  Rate: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(Number(lot.hourly_rate))}/hr</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit2 size={14} /> Edit
                </Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={() => handleDelete(lot.id)}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {lots.length === 0 && !loading && (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-gray-400">
            <MapPin size={40} className="mx-auto mb-3 opacity-50" />
            <p>No parking lots yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
