"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { User, Save } from "lucide-react"

export default function ProfilePage() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle_no: "",
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) loadProfile()
  }, [userId])

  async function loadProfile() {
    if (!userId) return
    const { data } = await supabase
      .from("users")
      .select("name, email, phone, vehicle_no")
      .eq("id", userId)
      .single()
    if (data) setProfile(data)
    setLoading(false)
  }

  async function handleSave() {
    if (!userId) return
    await supabase
      .from("users")
      .update(profile)
      .eq("id", userId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              placeholder="+92 300 1234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Vehicle Number
            </label>
            <Input
              value={profile.vehicle_no}
              onChange={(e) =>
                setProfile({ ...profile, vehicle_no: e.target.value })
              }
              placeholder="ABC-123"
            />
          </div>
          <Button onClick={handleSave}>
            <Save size={16} />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
