import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedPaths = [
    "/dashboard/admin",
    "/dashboard/user",
    "/dashboard/gatekeeper",
  ]

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtected) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (
      pathname.startsWith("/dashboard/admin") &&
      token.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (
      pathname.startsWith("/dashboard/gatekeeper") &&
      token.role !== "gatekeeper"
    ) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (
      pathname.startsWith("/dashboard/user") &&
      token.role !== "user"
    ) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
