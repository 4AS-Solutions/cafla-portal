import { supabaseServer } from "@/src/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await context.params

    const supabase = await supabaseServer()

    const {
      status,
      revision_notes,
    } = await req.json()

    // 🛡️ VALIDATION
    if (
      !["approved", "revision_required"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
    }

    // 🔥 SAVE REVISION NOTES
    if (status === "revision_required") {
      updateData.revision_notes =
        revision_notes?.trim() || null
    }

    // 🔥 CLEAR NOTES IF APPROVED
    if (status === "approved") {
      updateData.revision_notes = null
    }

    const { error } = await supabase
      .from("match_reports")
      .update(updateData)
      .eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
    })

  } catch (err) {

    console.error(err)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }

}