"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { Save } from "lucide-react"

export default function AdminSettingsPage() {
  const [rates, setRates] = useState({
    hourly_2wheeler: 30,
    hourly_4wheeler: 50,
    overstay_fine_per_hour: 100,
  })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure system parameters
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              2-Wheeler Hourly Rate (PKR)
            </label>
            <Input
              type="number"
              value={rates.hourly_2wheeler}
              onChange={(e) =>
                setRates({
                  ...rates,
                  hourly_2wheeler: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              4-Wheeler Hourly Rate (PKR)
            </label>
            <Input
              type="number"
              value={rates.hourly_4wheeler}
              onChange={(e) =>
                setRates({
                  ...rates,
                  hourly_4wheeler: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Overstay Fine / hour (PKR)
            </label>
            <Input
              type="number"
              value={rates.overstay_fine_per_hour}
              onChange={(e) =>
                setRates({
                  ...rates,
                  overstay_fine_per_hour: parseInt(e.target.value),
                })
              }
            />
          </div>
          <Button onClick={handleSave}>
            <Save size={16} />
            {saved ? "Saved!" : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
