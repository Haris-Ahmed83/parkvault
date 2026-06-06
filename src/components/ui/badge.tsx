"use client"

import { cn, getStatusColor } from "@/lib/utils"

interface BadgeProps {
  status: string
  children?: React.ReactNode
}

export default function Badge({ status, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        getStatusColor(status)
      )}
    >
      {children || status}
    </span>
  )
}
