import { createServerClient } from "@supabase/ssr"

import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {

  const res = NextResponse.next()

  // =========================================
  // 🔥 SUPABASE SSR CLIENT
  // =========================================
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },

        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },

        remove(name, options) {
          res.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    }
  )

  // =========================================
  // 🔥 ROUTES
  // =========================================
  const pathname = req.nextUrl.pathname

  const isPortal = pathname.startsWith("/portal")

  const isAdmin = pathname.startsWith("/admin")

  const isLogin = pathname === "/login"

  const isCompleteProfile = pathname === "/complete-profile"

  const isCallback = pathname.startsWith("/auth")

  // =========================================
  // 🚫 ALWAYS ALLOW AUTH ROUTES
  // =========================================
  if (isCallback) {

    return res
  }

  // =========================================
  // 🔐 GET USER SESSION
  // =========================================
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // =========================================
  // 🚫 NOT AUTHENTICATED
  // =========================================
  if (!user) {

    // 🔥 allow onboarding/invite flow
    if (isCompleteProfile) {

      return res
    }

    // 🔥 protected routes
    if (isPortal || isAdmin) {

      return NextResponse.redirect(
        new URL("/login", req.url)
      )
    }

    // 🔥 public routes
    return res
  }

  // =========================================
  // ✅ AUTHENTICATED USERS
  // =========================================

  // 🚫 prevent logged users from seeing login
  if (isLogin) {

    return NextResponse.redirect(
      new URL("/portal", req.url)
    )
  }

  return res
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/admin/:path*",
    "/login",
    "/complete-profile",
    "/auth/:path*",
  ],
}