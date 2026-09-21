import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBoardApi } from "@/src/lib/auth/require-board-api";
import {
  authorizationOrUnexpectedFinanceError,
  safeFinanceError,
} from "@/src/lib/finance/api-responses";
import {
  BOARD_TRANSACTION_TYPES,
  resolveBoardTransactionEntry,
} from "@/src/lib/finance/transaction-entry";
import { supabaseServer } from "@/src/lib/supabase/server";
const schema = z.object({
  unregistered_referee_id: z.string().uuid(),
  transaction_date: z.iso.date(),
  transaction_type: z.enum(BOARD_TRANSACTION_TYPES),
  amount: z.string().trim().min(1),
  adjustment_direction: z
    .enum(["member_owes_cafla", "cafla_owes_member"])
    .nullable()
    .optional(),
  description: z.string().trim().min(1).max(500),
  internal_notes: z.string().trim().max(2000).nullable().optional(),
  payment_method: z
    .enum(["zelle", "cash", "check", "other"])
    .nullable()
    .optional(),
  idempotency_key: z.string().uuid(),
});
export async function POST(request: Request) {
  try {
    await requireBoardApi();
    const p = schema.safeParse(await request.json().catch(() => null));
    if (!p.success)
      return safeFinanceError("Check the pending transaction details.", 400);
    let entry: ReturnType<typeof resolveBoardTransactionEntry>;
    try {
      entry = resolveBoardTransactionEntry({
        transactionType: p.data.transaction_type,
        amount: p.data.amount,
        paymentMethod: p.data.payment_method,
        adjustmentDirection: p.data.adjustment_direction,
      });
    } catch (error) {
      return safeFinanceError(
        error instanceof Error
          ? error.message
          : "Check the transaction amount.",
        400,
      );
    }
    const db = await supabaseServer();
    const { data, error } = await db
      .schema("finance")
      .rpc("record_unregistered_transaction", {
        p_unregistered_referee_id: p.data.unregistered_referee_id,
        p_transaction_date: p.data.transaction_date,
        p_transaction_type: p.data.transaction_type,
        p_amount_cents: entry.amountCents.toString(),
        p_description: p.data.description,
        p_payment_method: entry.paymentMethod,
        p_internal_notes: p.data.internal_notes || null,
        p_source_type: null,
        p_source_id: null,
        p_idempotency_key: p.data.idempotency_key,
        p_metadata: {},
      });
    if (error)
      return safeFinanceError(
        error.code === "23505"
          ? "This transaction was already recorded."
          : error.message?.includes("Linked")
            ? "Linked accounts cannot receive new pending transactions."
            : "Unable to record the pending transaction.",
        error.code === "23505" || error.message?.includes("Linked") ? 409 : 500,
      );
    return NextResponse.json(
      { success: true, transaction: data },
      { status: 201 },
    );
  } catch (error) {
    return authorizationOrUnexpectedFinanceError(
      error,
      "record unregistered transaction",
    );
  }
}
