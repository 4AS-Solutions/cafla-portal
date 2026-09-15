import { NextResponse } from "next/server"
import { z } from "zod"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { getArbiterFeeImport } from "@/src/lib/finance/arbiter-fees/server"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

const bodySchema = z.object({ member_id: z.string().uuid() })

export async function PATCH(request: Request, { params }: { params: Promise<{ import_id: string; item_id: string }> }) {
  try {
    const board = await requireBoardApi()
    const ids = await params
    if (!z.string().uuid().safeParse(ids.import_id).success || !z.string().uuid().safeParse(ids.item_id).success) return safeFinanceError("Invalid import item.", 400)
    const parsed = bodySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return safeFinanceError("Choose a valid member.", 400)
    const db = getSupabaseAdmin()
    const { data: member, error: memberError } = await db.from("members").select("id").eq("id", parsed.data.member_id).maybeSingle()
    if (memberError) throw memberError
    if (!member) return safeFinanceError("Member not found.", 404)
    const { data: source, error: sourceError } = await db.schema("finance").from("arbiter_fee_import_items").select("normalized_referee_name,item_status").eq("id", ids.item_id).eq("import_id", ids.import_id).maybeSingle()
    if (sourceError) throw sourceError
    if (!source) return safeFinanceError("Import item not found.", 404)
    if (source.item_status !== "new") return safeFinanceError("Only new assignments can be resolved.", 409)
    const { error } = await db.schema("finance").from("arbiter_fee_import_items").update({ member_id: parsed.data.member_id, resolution_confirmed: true, resolution_method: "board_confirmed", resolved_by: board.id, resolved_at: new Date().toISOString() }).eq("import_id", ids.import_id).eq("normalized_referee_name", source.normalized_referee_name).eq("item_status", "new")
    if (error) throw error
    return NextResponse.json({ success: true, ...(await getArbiterFeeImport(ids.import_id)) })
  } catch (error) {
    return authorizationOrUnexpectedFinanceError(error, "resolve Arbiter referee")
  }
}
