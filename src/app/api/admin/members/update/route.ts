import { NextResponse } from "next/server"
import { createClient } from "@/src/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // 🔐 1. USER
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 🧠 2. VALIDATE BOARD
    const { data: currentMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!currentMember || currentMember.role !== "board") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 📦 3. BODY
    const body = await req.json()

    const {
      member_id,
      full_name,
      phone,
      ussf_id,
      grade,
      category,
      years_in_cafla,
      role,
      status,
    } = body

    if (!member_id) {
      return NextResponse.json({ error: "Missing member_id" }, { status: 400 })
    }

    // 🚨 4. RULE: MAX 5 BOARDS
    if (role === "board") {
      const { count } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("role", "board")

      if (count && count >= 5) {
        return NextResponse.json(
          { error: "Maximum number of board members reached" },
          { status: 400 }
        )
      }
    }

    // ✏️ 5. UPDATE
    const { error } = await supabase
      .from("members")
      .update({
        full_name,
        phone,
        ussf_id,
        grade,
        category,
        years_in_cafla,
        role,
        status,
      })
      .eq("id", member_id)

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: "Failed to update member" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    )
  }
}