"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import ThemeToggle from "./ThemeToggle"
import Button from "@/components/ui/button"
import { Building2, LogOut, Menu, X, User, Shield, ShieldCheck } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              Park<span className="text-primary-600">Vault</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href={
                    session.user.role === "admin"
                      ? "/dashboard/admin"
                      : session.user.role === "gatekeeper"
                      ? "/dashboard/gatekeeper"
                      : "/dashboard/user"
                  }
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {session.user.role === "admin" ? (
                    <Shield size={16} />
                  ) : session.user.role === "gatekeeper" ? (
                    <ShieldCheck size={16} />
                  ) : (
                    <User size={16} />
                  )}
                  {session.user.name}
                </Link>
                <ThemeToggle />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 animate-fade-in">
          <div className="flex flex-col gap-3">
            {session ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-800">
                  <User size={16} />
                  {session.user.name}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-sm text-red-500"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="w-full">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
