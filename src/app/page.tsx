import Link from "next/link"
import Button from "@/components/ui/button"
import {
  Building2,
  QrCode,
  Zap,
  Clock,
  Shield,
  BarChart3,
  Check,
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Real-Time Availability",
    desc: "See live parking slot availability with instant updates.",
  },
  {
    icon: QrCode,
    title: "Instant Booking",
    desc: "Reserve your spot in seconds. Get QR code confirmation.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "JWT authentication and encrypted transactions.",
  },
  {
    icon: Clock,
    title: "Smart Fee Calculation",
    desc: "Automated billing based on actual parking duration.",
  },
]

const steps = [
  { num: 1, title: "Register & Login", desc: "Create your account in minutes." },
  { num: 2, title: "Find & Reserve", desc: "Browse available slots and book." },
  { num: 3, title: "Arrive & Scan", desc: "Scan your QR code for entry." },
  { num: 4, title: "Pay & Leave", desc: "Automatic fee calculation on exit." },
]

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-blue-600/5 to-transparent dark:from-indigo-950/20 dark:via-blue-950/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
              🅿️ Smart Parking Intelligence
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Park{" "}
              <span className="text-gradient">Smarter,</span>
              <br />
              Not Harder
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              The intelligent parking management system that eliminates the
              stress of finding parking. Real-time availability, instant
              booking, QR entry, and automated billing — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button className="text-base px-8 py-3">
                  Start Free Today
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="text-base px-8 py-3">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto">
            {[
              { value: "500+", label: "Parking Slots" },
              { value: "10K+", label: "Happy Users" },
              { value: "99.9%", label: "Uptime" },
              { value: "< 30s", label: "Avg Booking Time" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Built with cutting-edge technology to solve real-world parking
              challenges efficiently.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {f.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Get started in 4 simple steps
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                  {s.num}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Join thousands of drivers who park smarter every day.
          </p>
          <Link href="/register">
            <Button className="text-base px-8 py-3">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2026 ParkVault. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
