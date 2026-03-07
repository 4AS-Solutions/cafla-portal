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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPortal = req.nextUrl.pathname.startsWith("/portal")

  if (isPortal && !user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

export const config = {
  matcher: ["/portal/:path*"],
}