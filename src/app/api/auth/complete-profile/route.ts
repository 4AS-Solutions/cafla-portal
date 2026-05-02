import { NextResponse } from "next/server"
import { supabaseServer } from "@/src/lib/supabase/server"

export async function POST(req: Request) {
  try {

    const supabase = await supabaseServer()

    // 🔐 USER
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 📦 BODY
    const body = await req.json()
    const { phone, ussf_id, grade, password } = body

    if (!phone || !ussf_id || !grade || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // 🔐 SET PASSWORD
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    })

    if (passwordError) {
      console.error("❌ PASSWORD ERROR:", passwordError)
      return NextResponse.json(
        { error: "Failed to set password" },
        { status: 500 }
      )
    }

    // 🧠 UPDATE MEMBER (🔥 CAMBIO CLAVE)
    const { error: updateError } = await supabase
      .from("members")
      .update({
        phone,
        ussf_id,
        grade,
        status: "active", // 🔥 activar usuario
        notes: "Profile completed on " + new Date().toISOString(), // 🔥 agregar nota de completado
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("❌ MEMBER UPDATE ERROR:", updateError)
      return NextResponse.json(
        { error: "Failed to update member" },
        { status: 500 }
      )
    }


    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error("💥 COMPLETE PROFILE CRASH:", err)
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}