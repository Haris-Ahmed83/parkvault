"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatusBadge from "@/components/shared/StatusBadge"
import Input from "@/components/ui/input"
import { Search, Shield, ShieldCheck, User as UserIcon, Trash2 } from "lucide-react"
import Button from "@/components/ui/button"
import type { User } from "@/types"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this user?")) {
      await supabase.from("users").delete().eq("id", id)
      loadUsers()
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Users
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage all users
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

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
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Wallet
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{u.email}</td>
                    <td className="py-3 px-4">
                      {u.role === "admin" ? (
                        <Shield size={16} className="text-indigo-600" />
                      ) : u.role === "gatekeeper" ? (
                        <ShieldCheck size={16} className="text-blue-600" />
                      ) : (
                        <UserIcon size={16} className="text-gray-400" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {u.vehicle_no || "-"}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      PKR {u.wallet_balance}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(u.id)}
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
