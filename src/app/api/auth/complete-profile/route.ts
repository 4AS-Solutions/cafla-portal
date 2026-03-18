import { NextResponse } from "next/server"
import { createClient } from "@/src/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // =========================
    // 🔐 1. GET AUTH USER
    // =========================
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

    // =========================
    // 📦 2. BODY
    // =========================
    const body = await req.json()

    const {
      phone,
      ussf_id,
      grade,
    } = body

    // =========================
    // 🧠 3. VALIDATION
    // =========================
    if (!phone || !ussf_id || !grade) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // =========================
    // 📊 4. VERIFY MEMBER
    // =========================
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("status")
      .eq("id", user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // =========================
    // 🚫 5. ONLY INVITED USERS
    // =========================
    if (member.status !== "invited") {
      return NextResponse.json(
        { error: "Profile already completed" },
        { status: 400 }
      )
    }

    // =========================
    // ✏️ 6. UPDATE MEMBER
    // =========================
    const { error: updateError } = await supabase
      .from("members")
      .update({
        phone,
        ussf_id,
        grade,
        status: "active",
      })
      .eq("id", user.id)

    if (updateError) {
      console.error(updateError)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    // =========================
    // ✅ SUCCESS
    // =========================
    return NextResponse.json({
      success: true,
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}