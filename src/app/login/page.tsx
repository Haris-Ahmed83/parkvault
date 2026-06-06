"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import {
  User,
  Shield,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react"
import { motion } from "framer-motion"

const roles = [
  {
    id: "user" as const,
    label: "User",
    description: "Book parking slots and manage reservations",
    icon: User,
  },
  {
    id: "admin" as const,
    label: "Admin",
    description: "Manage the system, users, and parking areas",
    icon: Shield,
  },
  {
    id: "gatekeeper" as const,
    label: "Gatekeeper",
    description: "Scan QR codes and manage gate entry/exit",
    icon: ShieldCheck,
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [useOtp, setUseOtp] = useState(false)

  async function handleSendOtp() {
    if (!email || !selectedRole) return
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: selectedRole }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Failed to send OTP")
      setLoading(false)
      return
    }

    setOtpSent(true)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    setLoading(true)
    setError("")

    const credentials: Record<string, string> = {
      email,
      role: selectedRole,
    }

    if (useOtp) {
      credentials.otp = otp
    } else {
      credentials.password = password
    }

    const result = await signIn("credentials", {
      ...credentials,
      redirect: false,
    })

    if (result?.error) {
      setError(useOtp ? "Invalid or expired OTP" : "Invalid credentials or role mismatch")
      setLoading(false)
      return
    }

    const redirectMap: Record<string, string> = {
      admin: "/dashboard/admin",
      user: "/dashboard/user",
      gatekeeper: "/dashboard/gatekeeper",
    }
    router.push(redirectMap[selectedRole])
    router.refresh()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link
            href="/"
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Park<span className="text-primary-600">Vault</span>
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Select your role to continue.
            </p>

            <div className="space-y-3">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedRole === role.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        selectedRole === role.id
                          ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {role.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {role.description}
                      </p>
                    </div>
                    {selectedRole === role.id && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {selectedRole && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {!useOtp ? (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Signing in..." : "Continue"}
                      <ArrowRight size={18} />
                    </Button>

                    {selectedRole !== "admin" && (
                      <p className="text-center text-sm text-gray-400">
                        Or{" "}
                        <button
                          type="button"
                          onClick={() => setUseOtp(true)}
                          className="text-indigo-600 font-medium hover:underline"
                        >
                          Login with OTP
                        </button>
                      </p>
                    )}
                  </>
                ) : !otpSent ? (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      An OTP will be sent to <strong>{email}</strong>
                    </p>
                    <Button
                      onClick={handleSendOtp}
                      disabled={loading || !email}
                      className="w-full"
                    >
                      {loading ? "Sending..." : "Send OTP"}
                      <ArrowRight size={18} />
                    </Button>
                    <p className="text-center text-sm text-gray-400">
                      <button
                        type="button"
                        onClick={() => setUseOtp(false)}
                        className="text-gray-500 hover:underline"
                      >
                        Back to password login
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Enter OTP
                      </label>
                      <Input
                        type="text"
                        placeholder="6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Check your email for the OTP
                      </p>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={loading || otp.length !== 6}
                      className="w-full"
                    >
                      {loading ? "Verifying..." : "Verify & Login"}
                      <ArrowRight size={18} />
                    </Button>

                    <div className="flex justify-between text-sm">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        Resend OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(""); setUseOtp(false) }}
                        className="text-gray-500 hover:underline"
                      >
                        Back
                      </button>
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2">
                    {error}
                  </p>
                )}
              </motion.div>
            )}

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-600 font-medium hover:underline"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-gradient-primary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-center"
        >
          <div className="text-8xl mb-6">🅿️</div>
          <h2 className="text-4xl font-bold mb-4">ParkVault</h2>
          <p className="text-indigo-200 text-lg max-w-sm leading-relaxed">
            Intelligent parking management that saves time, reduces congestion,
            and optimizes your parking experience.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-left max-w-xs mx-auto">
            {[
              "Real-time slot availability",
              "QR code entry & exit",
              "Automatic fee calculation",
              "Analytics dashboard",
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 text-indigo-100"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  ✓
                </div>
                {feature}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
