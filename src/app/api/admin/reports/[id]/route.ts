import { supabaseServer } from "@/src/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  try {
    const { id } = await context.params

    const supabase = await supabaseServer()
    const { status } = await req.json()

    // 🛡️ validación
    if (!["approved", "revision_required"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const { error } = await supabase
      .from("match_reports")
      .update({ status })
      .eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}