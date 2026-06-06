import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PricingRule } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ur-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function generateQRData(bookingId: string): string {
  return `parkvault-booking-${bookingId}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "text-green-600 bg-green-50 dark:bg-green-950/30",
    completed: "text-gray-600 bg-gray-50 dark:bg-gray-800/30",
    cancelled: "text-red-600 bg-red-50 dark:bg-red-950/30",
    pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
    scheduled: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
    missed: "text-red-600 bg-red-50 dark:bg-red-950/30",
    available: "text-green-600 bg-green-50 dark:bg-green-950/30",
    occupied: "text-red-600 bg-red-50 dark:bg-red-950/30",
    reserved: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
  }
  return colors[status] || "text-gray-600 bg-gray-50 dark:bg-gray-800/30"
}

export function calculateFee(
  hourlyRate: number,
  startTime: Date,
  endTime: Date
): number {
  const hours = Math.max(
    1,
    Math.ceil(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    )
  )
  return hours * hourlyRate
}

export function calculateDynamicFee(
  hourlyRate: number,
  startTime: Date,
  endTime: Date,
  rules: PricingRule[]
): number {
  let totalFee = 0
  let current = new Date(startTime)
  const end = new Date(endTime)

  while (current < end) {
    const hourEnd = new Date(current)
    hourEnd.setHours(current.getHours() + 1, 0, 0, 0)
    const slotEnd = hourEnd > end ? end : hourEnd
    const hoursInSlot = (slotEnd.getTime() - current.getTime()) / (1000 * 60 * 60)

    const dayOfWeek = current.getDay()
    const timeStr = current.toTimeString().slice(0, 5)
    const rule = rules.find(
      (r) =>
        r.is_active &&
        r.day_of_week === dayOfWeek &&
        timeStr >= r.start_time &&
        timeStr < r.end_time
    )
    const multiplier = rule?.multiplier || 1
    totalFee += hourlyRate * multiplier * hoursInSlot
    current = slotEnd
  }
  return Math.max(1, Math.round(totalFee))
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/directions?from=&to=${lat}%2C${lng}`
}
