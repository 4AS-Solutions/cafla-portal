import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, financeCommandError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { parseUsdToCents } from "@/src/lib/finance/money"
import { supabaseServer } from "@/src/lib/supabase/server"

const transactionTypes = [
  "payment", "annual_membership_fee", "manual_charge", "manual_credit", "adjustment",
] as const
const paymentMethods = ["zelle", "cash", "check", "other"] as const

const requestSchema = z.object({
  member_id: z.string().uuid(),
  transaction_date: z.iso.date(),
  transaction_type: z.enum(transactionTypes),
  amount: z.string().trim().min(1),
  adjustment_direction: z.enum(["member_owes_cafla", "cafla_owes_member"]).nullable().optional(),
  description: z.string().trim().min(1).max(500),
  internal_notes: z.string().trim().max(2000).nullable().optional(),
  payment_method: z.enum(paymentMethods).nullable().optional(),
  idempotency_key: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    await requireBoardApi()
    const parsed = requestSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return safeFinanceError("Check the transaction details and try again.", 400)

    const body = parsed.data
    let enteredCents: bigint
    try {
      enteredCents = parseUsdToCents(body.amount)
    } catch {
      return safeFinanceError("Enter a valid USD amount with no more than two decimal places.", 400)
    }
    if (enteredCents <= BigInt(0)) return safeFinanceError("Amount must be greater than zero.", 400)

    if (body.transaction_type === "payment" && !body.payment_method) {
      return safeFinanceError("Payment method is required for payments.", 400)
    }
    if (body.transaction_type !== "payment" && body.payment_method) {
      return safeFinanceError("Payment method is only allowed for payments.", 400)
    }
    if (body.transaction_type === "adjustment" && !body.adjustment_direction) {
      return safeFinanceError("Choose who owes the adjustment amount.", 400)
    }
    if (body.transaction_type !== "adjustment" && body.adjustment_direction) {
      return safeFinanceError("Adjustment direction is only allowed for adjustments.", 400)
    }

    const positive = body.transaction_type === "payment" || body.transaction_type === "manual_credit" || body.adjustment_direction === "cafla_owes_member"
    const amountCents = positive ? enteredCents : -enteredCents
    const supabase = await supabaseServer()
    const memberCheck = await supabase.from("members").select("id").eq("id", body.member_id).maybeSingle()
    if (memberCheck.error) throw memberCheck.error
    if (!memberCheck.data) return safeFinanceError("Member not found.", 404)

    const { data, error } = await supabase.schema("finance").rpc("record_transaction", {
      p_member_id: body.member_id,
      p_transaction_date: body.transaction_date,
      p_transaction_type: body.transaction_type,
      p_amount_cents: amountCents.toString(),
      p_description: body.description,
      p_payment_method: body.transaction_type === "payment" ? body.payment_method : null,
      p_internal_notes: body.internal_notes || null,
      p_match_id: null,
      p_source_type: null,
      p_source_id: null,
      p_idempotency_key: body.idempotency_key,
      p_metadata: {},
    })
    if (error) return financeCommandError(error, "record")

    revalidatePath("/admin/finance")
    revalidatePath(`/admin/finance/members/${body.member_id}`)
    revalidatePath("/portal/finances")

    return NextResponse.json({ success: true, transaction: selectTransaction(data) }, { status: 201 })
  } catch (error) {
    return authorizationOrUnexpectedFinanceError(error, "record transaction")
  }
}

function selectTransaction(value: unknown) {
  if (!value || typeof value !== "object") return null
  const row = value as Record<string, unknown>
  return { id: row.id, member_id: row.member_id, transaction_date: row.transaction_date, transaction_type: row.transaction_type, amount_cents: row.amount_cents, description: row.description, payment_method: row.payment_method, created_at: row.created_at }
}
