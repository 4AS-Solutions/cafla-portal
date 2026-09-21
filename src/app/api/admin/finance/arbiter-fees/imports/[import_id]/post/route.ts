import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { supabaseServer } from "@/src/lib/supabase/server"

export async function POST(_: Request, { params }: { params: Promise<{ import_id: string }> }) {
  try {
    await requireBoardApi()
    const id = (await params).import_id
    if (!z.string().uuid().safeParse(id).success) return safeFinanceError("Invalid import ID.", 400)
    const db = await supabaseServer()
    const { data, error } = await db.schema("finance").rpc("post_arbiter_fee_import", { p_import_id: id })
    if (error) {
      console.error("[FINANCE] Arbiter fee posting failed:", error)
      if (error.message?.includes("posted concurrently")) return safeFinanceError("One or more assignments were posted concurrently. Refresh the preview.", 409)
      if (error.message?.includes("predates Bill-To fee validation")) return safeFinanceError(error.message, 409)
      if (error.message?.match(/resolved|no new|period|available for posting|already/i)) return safeFinanceError(error.message, 409)
      if (error.code === "42501") return safeFinanceError("Board access is required.", 403)
      return safeFinanceError("Unable to post Arbiter fees.", 500)
    }
    revalidatePath("/admin/finance")
    revalidatePath("/portal/finances")
    return NextResponse.json({ success: true, result: data })
  } catch (error) {
    return authorizationOrUnexpectedFinanceError(error, "post Arbiter fees")
  }
}
