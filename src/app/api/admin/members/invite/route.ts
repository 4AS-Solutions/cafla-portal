import { NextResponse } from "next/server"
import { requireBoard } from "@/src/lib/auth/require-board"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    console.log("INVITE: 🚀 INVITE START")

    await requireBoard()

    const supabase = getSupabaseAdmin()

    const body = await req.json()
    const { email, full_name } = body

    if (!email || !full_name) {
      return NextResponse.json(
        { error: "Email and full name are required" },
        { status: 400 }
      )
    }

    console.log("INVITE: 🚀 INVITE START")

    console.log("INVITE: 📧 Email:", email)
    console.log("INVITE: 👤 Name:", full_name)
    console.log("INVITE: 🌍 Redirect:", `${process.env.NEXT_PUBLIC_BASE_URL}/complete-profile`)

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name,
        },
        // 🔥 FIX CRÍTICO AQUÍ
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      }
    )

    console.log("INVITE: 📨 RESPONSE:", data)
    console.log("INVITE: ❌ ERROR:", error)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error("💥 CRASH:", err)
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    )
  }
}