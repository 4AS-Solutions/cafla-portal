import { NextResponse } from "next/server"
import { z } from "zod"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { getArbiterFeeImport } from "@/src/lib/finance/arbiter-fees/server"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

const bodySchema = z.union([
  z.object({ target_type: z.literal("member"), member_id: z.string().uuid() }),
  z.object({ target_type: z.literal("unregistered"), unregistered_referee_id: z.string().uuid() }),
])

export async function PATCH(request: Request, { params }: { params: Promise<{ import_id: string; item_id: string }> }) {
  try {
    const board = await requireBoardApi()
    const ids = await params
    if (!z.string().uuid().safeParse(ids.import_id).success || !z.string().uuid().safeParse(ids.item_id).success) return safeFinanceError("Invalid import item.", 400)
    const parsed = bodySchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return safeFinanceError("Choose a valid financial identity.", 400)
    const db = getSupabaseAdmin()
    if (parsed.data.target_type === "member") {
      const { data, error } = await db.from("members").select("id").eq("id", parsed.data.member_id).maybeSingle()
      if (error) throw error
      if (!data) return safeFinanceError("Member not found.", 404)
    } else {
      const { data, error } = await db.schema("finance").from("unregistered_referees").select("id").eq("id", parsed.data.unregistered_referee_id).maybeSingle()
      if (error) throw error
      if (!data) return safeFinanceError("Unregistered financial identity not found.", 404)
      const { data: linked } = await db.schema("finance").from("unregistered_referee_links").select("id").eq("unregistered_referee_id", parsed.data.unregistered_referee_id).maybeSingle()
      if (linked) return safeFinanceError("This unregistered identity has already been linked to a member.", 409)
    }
    const { data: source, error: sourceError } = await db.schema("finance").from("arbiter_fee_import_items").select("normalized_referee_name,item_status").eq("id", ids.item_id).eq("import_id", ids.import_id).maybeSingle()
    if (sourceError) throw sourceError
    if (!source) return safeFinanceError("Import item not found.", 404)
    if (source.item_status !== "new") return safeFinanceError("Only new assignments can be resolved.", 409)
    const target = parsed.data.target_type === "member"
      ? { member_id: parsed.data.member_id, unregistered_referee_id: null, resolution_method: "board_confirmed" }
      : { member_id: null, unregistered_referee_id: parsed.data.unregistered_referee_id, resolution_method: "unregistered_confirmed" }
    const { error } = await db.schema("finance").from("arbiter_fee_import_items").update({ ...target, resolution_confirmed: true, resolved_by: board.id, resolved_at: new Date().toISOString() }).eq("import_id", ids.import_id).eq("normalized_referee_name", source.normalized_referee_name).eq("item_status", "new")
    if (error) throw error
    return NextResponse.json({ success: true, ...(await getArbiterFeeImport(ids.import_id)) })
  } catch (error) {
    return authorizationOrUnexpectedFinanceError(error, "resolve Arbiter referee")
  }
}
