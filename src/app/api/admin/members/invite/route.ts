import { NextResponse } from "next/server"
import { requireBoard } from "@/src/lib/auth/require-board"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"


export async function POST(req: Request) {
  try {
    // 🔐 1. Verificar que sea board
    await requireBoard()

    const admin = getSupabaseAdmin();

    const body = await req.json()
    const { email, full_name } = body

    // 🧠 2. Validación básica
    if (!email || !full_name) {
      return NextResponse.json(
        { error: "Email and full name are required" },
        { status: 400 }
      )
    }

    // 📩 3. Enviar invitación
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`, // URL de redirección después de aceptar la invitación
    })

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    )
  }
}