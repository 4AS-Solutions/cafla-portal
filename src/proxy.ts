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
  const isCallback = pathname === "/auth/callback"


  // =========================
  // 🚨 0. ALLOW CALLBACK SIEMPRE
  // =========================
  if (isCallback) {

    return res
  }

  // =========================
  // 👤 GET USER
  // =========================
  const {
    data: { user },
  } = await supabase.auth.getUser()


  // =========================
  // 🔐 1. NOT AUTHENTICATED
  // =========================
  if (!user) {


    // 🔥 permitir complete-profile (para tokens)
    if (isCompleteProfile) {
      return res
    }

    if (isPortal) {
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
    .maybeSingle()


  // =========================
  // 🚨 VALIDACIÓN MEMBER
  // =========================
  if (!member || !member.status) {


    // 🔥 permitir onboarding aunque falte data
    if (isCompleteProfile) {
      return res
    }

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


    // 🔥 solo redirige si NO está ya en complete-profile
    if (!isCompleteProfile) {
      return NextResponse.redirect(new URL("/complete-profile", req.url))
    }

    return res // 🔥 CRÍTICO: evita loop
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
    "/auth/callback",
  ],
}