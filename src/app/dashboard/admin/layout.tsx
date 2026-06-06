"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  CalendarCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  LineChart,
  Percent,
  Clock,
  LogIn,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ThemeToggle from "@/components/layout/ThemeToggle"
import { useState } from "react"
import { signOut } from "next-auth/react"

const sidebarLinks = [
  {
    href: "/dashboard/admin",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/admin/lots",
    label: "Parking Lots",
    icon: Building2,
  },
  {
    href: "/dashboard/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/dashboard/admin/gatekeepers",
    label: "Gatekeepers",
    icon: ShieldCheck,
  },
  {
    href: "/dashboard/admin/bookings",
    label: "Bookings",
    icon: CalendarCheck,
  },
  {
    href: "/dashboard/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/dashboard/admin/settings",
    label: "Settings",
    icon: Settings,
  },
  {
    href: "/dashboard/admin/pricing",
    label: "Pricing Rules",
    icon: Percent,
  },
  {
    href: "/dashboard/admin/shifts",
    label: "Staff Shifts",
    icon: Clock,
  },
  {
    href: "/dashboard/admin/login-logs",
    label: "Login Logs",
    icon: LogIn,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 lg:relative lg:translate-x-0 pt-16 lg:pt-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col p-4 pt-6">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                Admin Panel
              </p>
              <p className="text-xs text-gray-400">{session.user.email}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
