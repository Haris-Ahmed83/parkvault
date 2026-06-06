"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Badge from "@/components/ui/badge"
import StatusBadge from "@/components/shared/StatusBadge"
import ParkingMap from "@/components/maps/ParkingMap"
import { MapPin, Car, ArrowRight, Navigation, Layers, Clock } from "lucide-react"
import { formatCurrency, formatTime, calculateDistance, getDirectionsUrl } from "@/lib/utils"
import type { ParkingLot, Slot, PricingRule } from "@/types"

const slotTypeIcon: Record<string, string> = {
  "2wheeler": "\u{1F3CD}",
  "4wheeler": "\u{1F697}",
}

const slotStatusColor: Record<string, string> = {
  available: "border-green-500 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50",
  occupied: "border-red-300 bg-red-50 dark:bg-red-950/20 opacity-60 cursor-not-allowed",
  reserved: "border-blue-400 bg-blue-50 dark:bg-blue-950/30 cursor-not-allowed",
}

export default function FindParkingPage() {
  const { data: session } = useSession()
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [bookingForm, setBookingForm] = useState({
    hours: 1,
    vehicle_no: "",
  })
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    loadLots()
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }, [])

  useEffect(() => {
    fetch("/api/pricing-rules")
      .then((r) => r.json())
      .then((data) => setPricingRules(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel("lots-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parking_lots" },
        (payload: any) => {
          setLots((prev) =>
            prev.map((l) =>
              l.id === payload.new.id ? { ...l, ...payload.new } : l
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (!selectedLot) {
      setSlots([])
      setSelectedSlot(null)
      return
    }
    setSlotsLoading(true)
    setSelectedSlot(null)
    fetch(`/api/slots?lot_id=${selectedLot.id}`)
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedLot])

  async function loadLots() {
    const { data } = await supabase
      .from("parking_lots")
      .select("*")
      .eq("is_active", true)
    if (data) setLots(data)
    setLoading(false)
  }

  const getUserLocation = useCallback(() => {
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationLoading(false)
      },
      () => setLocationLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const sortedLots = useMemo(() => {
    if (!userLocation) return lots
    return [...lots].sort((a, b) => {
      const dA = calculateDistance(userLocation.lat, userLocation.lng, Number(a.lat), Number(a.lng))
      const dB = calculateDistance(userLocation.lat, userLocation.lng, Number(b.lat), Number(b.lng))
      return dA - dB
    })
  }, [lots, userLocation])

  function getDistance(lot: ParkingLot): number | null {
    if (!userLocation) return null
    return calculateDistance(userLocation.lat, userLocation.lng, Number(lot.lat), Number(lot.lng))
  }

  const activeRule = useMemo(() => {
    if (!selectedLot) return null
    const now = new Date()
    const dayOfWeek = now.getDay()
    const timeStr = now.toTimeString().slice(0, 5)
    return pricingRules.find(
      (r) =>
        r.lot_id === selectedLot.id &&
        r.is_active &&
        r.day_of_week === dayOfWeek &&
        timeStr >= r.start_time &&
        timeStr < r.end_time
    ) || null
  }, [selectedLot, pricingRules])

  const totalFee = useMemo(() => {
    if (!selectedLot) return 0
    const base = bookingForm.hours * Number(selectedLot.hourly_rate)
    return activeRule ? Math.round(base * activeRule.multiplier) : base
  }, [selectedLot, bookingForm.hours, activeRule])

  const slotsByFloor = useMemo(() => {
    const map = new Map<number, Slot[]>()
    slots.forEach((s) => {
      if (!map.has(s.floor)) map.set(s.floor, [])
      map.get(s.floor)!.push(s)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  }, [slots])

  const handleLotClick = useCallback(
    (mapLot: { id: string }) => {
      const found = lots.find((l) => l.id === mapLot.id)
      if (found) setSelectedLot(found)
    },
    [lots]
  )

  async function handleBook() {
    if (!selectedLot || !selectedSlot || !bookingForm.vehicle_no || !session?.user?.id) return

    setBookingLoading(true)

    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + bookingForm.hours * 60 * 60 * 1000)
    const fee = totalFee

    const { data: userData } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", session.user.id)
      .single()

    if ((userData?.wallet_balance || 0) < fee) {
      alert("Insufficient wallet balance. Please top up.")
      setBookingLoading(false)
      return
    }

    const { data: newBooking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        lot_id: selectedLot.id,
        slot_id: selectedSlot.id,
        vehicle_no: bookingForm.vehicle_no,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "active",
        fee,
        qr_code: `PKV-${Date.now()}`,
        user_id: session.user.id,
      })
      .select()
      .single()

    if (bookingErr) {
      setBookingLoading(false)
      return
    }

    await supabase
      .from("users")
      .update({ wallet_balance: (userData?.wallet_balance || 0) - fee })
      .eq("id", session.user.id)

    await supabase.from("transactions").insert({
      user_id: session.user.id,
      amount: fee,
      type: "debit",
      description: `Parking at ${selectedLot.name} - Slot ${selectedSlot.slot_number}`,
    })

    await supabase
      .from("parking_lots")
      .update({ available_slots: Number(selectedLot.available_slots) - 1 })
      .eq("id", selectedLot.id)

    await supabase
      .from("slots")
      .update({ status: "occupied" })
      .eq("id", selectedSlot.id)

    fetch("/api/send-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: newBooking.id }),
    })

    setSelectedLot(null)
    setSelectedSlot(null)
    setBookingForm({ hours: 1, vehicle_no: "" })
    setBookingLoading(false)
    loadLots()
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Parking</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Browse available parking lots near you
          </p>
        </div>
        {!userLocation && (
          <Button
            variant="outline"
            size="sm"
            onClick={getUserLocation}
            disabled={locationLoading}
          >
            <Navigation size={16} />
            {locationLoading ? "Locating..." : "Use My Location"}
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <ParkingMap
          lots={sortedLots.map((l) => ({
            ...l,
            lat: Number(l.lat),
            lng: Number(l.lng),
          }))}
          height="400px"
          onLotClick={handleLotClick}
          selectedLotId={selectedLot?.id || null}
        />
      </Card>

      <div className="grid gap-4">
        {sortedLots.map((lot) => {
          const distance = getDistance(lot)
          const isSelected = selectedLot?.id === lot.id
          const isSlotPhase = isSelected && selectedSlot

          return (
            <Card key={lot.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{lot.name}</h3>
                        {distance !== null && (
                          <Badge status="available">
                            {distance < 1
                              ? `${(distance * 1000).toFixed(0)} m away`
                              : `${distance.toFixed(1)} km away`}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{lot.address}</p>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="text-sm text-gray-500">
                          Available:{" "}
                          <span className="font-semibold text-green-600 ml-1">
                            {lot.available_slots}/{lot.total_slots}
                          </span>
                        </span>
                        <span className="text-sm text-gray-500">
                          Rate:{" "}
                          <span className="font-semibold text-gray-900 dark:text-white ml-1">
                            {formatCurrency(Number(lot.hourly_rate))}/hr
                          </span>
                        </span>
                        {lot.has_2wheeler && (
                          <span className="text-sm text-gray-400">{slotTypeIcon["2wheeler"]}</span>
                        )}
                        {lot.has_4wheeler && (
                          <span className="text-sm text-gray-400">{slotTypeIcon["4wheeler"]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isSelected ? "primary" : "outline"}
                    onClick={() => setSelectedLot(isSelected ? null : lot)}
                  >
                    {isSelected ? (selectedSlot ? "Change Lot" : "Cancel") : "Book"}
                  </Button>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                    {slotsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : slotsByFloor.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No slots available</p>
                    ) : isSlotPhase ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Selected Slot: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedSlot.slot_number}</span>
                            <span className="text-gray-400 ml-2">
                              (Floor {selectedSlot.floor}) {slotTypeIcon[selectedSlot.type]}
                            </span>
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSlot(null)}
                          >
                            Change Slot
                          </Button>
                        </div>

                        {isSlotPhase && (
                          <div className="flex items-center gap-2">
                            <a
                              href={getDirectionsUrl(Number(lot.lat), Number(lot.lng))}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm">
                                <Navigation size={16} />
                                Get Directions
                              </Button>
                            </a>
                          </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                            <Input
                              placeholder="ABC-123"
                              value={bookingForm.vehicle_no}
                              onChange={(e) =>
                                setBookingForm({ ...bookingForm, vehicle_no: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                            <Input
                              type="number"
                              min={1}
                              value={bookingForm.hours}
                              onChange={(e) =>
                                setBookingForm({
                                  ...bookingForm,
                                  hours: parseInt(e.target.value) || 1,
                                })
                              }
                            />
                          </div>
                        </div>

                        {activeRule && (
                          <div className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-xl px-4 py-3">
                            <Clock size={16} />
                            <span>
                              Peak hours: {formatCurrency(
                                Math.round(Number(lot.hourly_rate) * activeRule.multiplier)
                              )}/hr (x{activeRule.multiplier}) —{" "}
                              {activeRule.start_time}–{activeRule.end_time}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="text-sm text-gray-500">
                              Total:{" "}
                              <span className="font-bold text-gray-900 dark:text-white">
                                {formatCurrency(totalFee)}
                              </span>
                            </p>
                            {activeRule && (
                              <p className="text-xs text-gray-400">
                                Base: {formatCurrency(bookingForm.hours * Number(lot.hourly_rate))}
                              </p>
                            )}
                          </div>
                          <Button onClick={handleBook} disabled={bookingLoading}>
                            {bookingLoading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                Confirm Booking <ArrowRight size={16} />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Layers size={16} />
                          Select a Slot
                        </p>
                        {slotsByFloor.map(([floor, floorSlots]) => (
                          <div key={floor}>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                              Floor {floor}
                            </p>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                              {floorSlots.map((slot) => {
                                const isAvailable = slot.status === "available"
                                return (
                                  <button
                                    key={slot.id}
                                    disabled={!isAvailable}
                                    onClick={() => isAvailable && setSelectedSlot(slot)}
                                    className={`
                                      relative flex flex-col items-center justify-center rounded-xl border-2 p-2
                                      transition-all duration-150
                                      ${slotStatusColor[slot.status]}
                                      ${
                                        selectedSlot?.id === slot.id
                                          ? "ring-2 ring-indigo-500 border-indigo-500"
                                          : ""
                                      }
                                    `}
                                  >
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                      {slot.slot_number}
                                    </span>
                                    <span className="text-sm leading-none">{slotTypeIcon[slot.type]}</span>
                                    <span className="text-[10px] mt-0.5 capitalize text-gray-500">
                                      {slot.status}
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        {lots.length === 0 && (
          <div className="text-center py-16">
            <Car size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No parking lots available
            </h3>
            <p className="text-gray-500">Check back later</p>
          </div>
        )}
      </div>
    </div>
  )
}
