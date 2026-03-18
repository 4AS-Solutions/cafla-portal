import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const pathname = req.nextUrl.pathname

  const isPortal = pathname.startsWith("/portal")
  const isLogin = pathname === "/login"
  const isCompleteProfile = pathname === "/complete-profile"
  const isCallback = pathname === "/callback" // ✅ NUEVO

  // =========================
  // 🚨 0. ALLOW CALLBACK SIEMPRE
  // =========================
  if (isCallback) {
    return res
  }

  let user = null

  if (!pathname.startsWith("/callback")) {
    const {
      data: { user: u },
    } = await supabase.auth.getUser()

    user = u
  }

  // =========================
  // 🔐 1. NOT AUTHENTICATED
  // =========================
  if (!user) {
    if (isPortal || isCompleteProfile) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return res
  }

  // =========================
  // 📊 GET MEMBER STATUS
  // =========================
  const { data: member } = await supabase
    .from("members")
    .select("status")
    .eq("id", user.id)
    .single()

  // 🚨 VALIDACIÓN CRÍTICA
  if (!member || !member.status) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const status = member.status

  // =========================
  // 🚫 2. LOGIN BLOCKED
  // =========================
  if (isLogin) {
    return NextResponse.redirect(new URL("/portal", req.url))
  }

  // =========================
  // 🧠 3. ONBOARDING CONTROL
  // =========================

  // 👉 usuario invitado
  if (status === "invited") {
    if (!isCompleteProfile) {
      return NextResponse.redirect(new URL("/complete-profile", req.url))
    }
  }

  // 👉 usuario activo
  if (status === "active") {
    if (isCompleteProfile) {
      return NextResponse.redirect(new URL("/portal", req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/login",
    "/complete-profile",
    "/callback", // ✅ IMPORTANTE
  ],
}