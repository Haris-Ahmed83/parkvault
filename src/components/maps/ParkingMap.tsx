"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapLot {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  available_slots: number
  total_slots: number
  hourly_rate: number
}

interface ParkingMapProps {
  lots: MapLot[]
  height?: string
  onLotClick?: (lot: MapLot) => void
  selectedLotId?: string | null
}

export default function ParkingMap({
  lots,
  height = "400px",
  onLotClick,
  selectedLotId,
}: ParkingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([31.5204, 74.3587], 12)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: "bottomright" }).addTo(map)

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    function handleLotSelect(e: CustomEvent) {
      const lotId = e.detail
      const lot = lots.find((l) => l.id === lotId)
      if (lot && onLotClick) onLotClick(lot)
    }
    document.addEventListener("lot-select" as any, handleLotSelect as any)
    return () => {
      document.removeEventListener("lot-select" as any, handleLotSelect as any)
    }
  }, [lots, onLotClick])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (lots.length === 0) return

    const bounds = L.latLngBounds([])

    lots.forEach((lot) => {
      const color =
        selectedLotId === lot.id
          ? "#4f46e5"
          : lot.available_slots > 0
          ? "#22c55e"
          : "#ef4444"

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background: ${color};
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          border: 3px solid white;
          cursor: pointer;
          transition: all 0.2s;
        ">${lot.available_slots}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([lot.lat, lot.lng], { icon }).addTo(map)

      marker.on("click", () => {
        if (onLotClick) onLotClick(lot)
      })

      marker.bindPopup(
        `<div style="
          font-family: system-ui, sans-serif;
          padding: 8px;
          min-width: 200px;
        ">
          <strong style="font-size: 14px; color: #111;">${lot.name}</strong>
          <p style="font-size: 12px; color: #666; margin: 4px 0;">${lot.address}</p>
          <div style="
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-top: 6px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
          ">
            <span>🅿️ ${lot.available_slots}/${lot.total_slots}</span>
            <span>💰 PKR ${lot.hourly_rate}/hr</span>
          </div>
          <button onclick="document.dispatchEvent(new CustomEvent('lot-select', {detail:'${lot.id}'}))" style="
            width: 100%;
            margin-top: 8px;
            padding: 8px;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          ">Book This Slot</button>
        </div>`
      )

      markersRef.current.push(marker)
      bounds.extend([lot.lat, lot.lng])
    })

    if (lots.length === 1) {
      map.setView([lots[0].lat, lots[0].lng], 15)
    } else {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [lots, selectedLotId, onLotClick])

  return <div ref={mapRef} style={{ height, width: "100%", borderRadius: "16px", overflow: "hidden" }} />
}
