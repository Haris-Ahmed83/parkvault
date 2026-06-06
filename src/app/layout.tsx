import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import SessionProvider from "@/components/layout/SessionProvider"
import Navbar from "@/components/layout/Navbar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ParkVault - Smart Parking Management",
  description:
    "Find, reserve, and manage parking spaces intelligently. Real-time availability, QR-code entry, and automated billing.",
  keywords:
    "parking, smart parking, parking management, parking reservation, ParkVault",
  manifest: "/manifest.json",
  icons: { icon: "/icon-192.svg" },
  appleWebApp: { capable: true, title: "ParkVault", statusBarStyle: "default" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
