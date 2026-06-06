import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "./supabase"
import type { UserRole } from "@/types"

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.role) return null

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", credentials.email as string)
          .single()

        if (error || !user) return null
        if (user.role !== credentials.role) return null

        if (credentials.otp) {
          const { data: otpRecord } = await supabaseAdmin
            .from("otp_codes")
            .select("*")
            .eq("email", credentials.email as string)
            .eq("otp", credentials.otp as string)
            .eq("role", credentials.role as string)
            .eq("used", false)
            .gte("expires_at", new Date().toISOString())
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (!otpRecord) return null

          await supabaseAdmin
            .from("otp_codes")
            .update({ used: true })
            .eq("id", otpRecord.id)
        } else if (credentials.password) {
          if ((credentials.password as string) !== user.password) return null
        } else {
          return null
        }

        supabaseAdmin.from("login_logs").insert({
          user_id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          method: credentials.otp ? "otp" : "password",
        }).then(undefined, () => {})

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role as UserRole
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
}
