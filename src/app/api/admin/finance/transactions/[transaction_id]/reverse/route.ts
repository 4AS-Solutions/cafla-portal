import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, financeCommandError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { supabaseServer } from "@/src/lib/supabase/server"

const requestSchema = z.object({
  transaction_date: z.iso.date(),
  description: z.string().trim().min(1).max(500),
  reversal_reason: z.string().trim().min(1).max(1000),
  internal_notes: z.string().trim().max(2000).nullable().optional(),
  idempotency_key: z.string().uuid(),
})

export async function POST(request: Request, context: { params: Promise<{ transaction_id: string }> }) {
  try {
    await requireBoardApi()
    const { transaction_id: transactionId } = await context.params
    if (!z.string().uuid().safeParse(transactionId).success) return safeFinanceError("Invalid transaction ID.", 400)
    const parsed = requestSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return safeFinanceError("Check the reversal details and try again.", 400)
    const body = parsed.data
    const supabase = await supabaseServer()
    const { data, error } = await supabase.schema("finance").rpc("reverse_transaction", {
      p_original_transaction_id: transactionId,
      p_transaction_date: body.transaction_date,
      p_description: body.description,
      p_reversal_reason: body.reversal_reason,
      p_idempotency_key: body.idempotency_key,
      p_internal_notes: body.internal_notes || null,
      p_metadata: {},
    })
    if (error) return financeCommandError(error, "reverse")

    const row = data && typeof data === "object" ? data as Record<string, unknown> : null
    revalidatePath("/admin/finance")
    if (typeof row?.member_id === "string") revalidatePath(`/admin/finance/members/${row.member_id}`)
    revalidatePath("/portal/finances")
    return NextResponse.json({ success: true, transaction: row ? { id: row.id, member_id: row.member_id, transaction_date: row.transaction_date, transaction_type: row.transaction_type, amount_cents: row.amount_cents, description: row.description, created_at: row.created_at } : null }, { status: 201 })
  } catch (error) {
    return authorizationOrUnexpectedFinanceError(error, "reverse transaction")
  }
}
