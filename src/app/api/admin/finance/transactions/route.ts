import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireBoardApi } from "@/src/lib/auth/require-board-api";
import {
  authorizationOrUnexpectedFinanceError,
  financeCommandError,
  safeFinanceError,
} from "@/src/lib/finance/api-responses";
import {
  BOARD_TRANSACTION_TYPES,
  resolveBoardTransactionEntry,
} from "@/src/lib/finance/transaction-entry";
import { supabaseServer } from "@/src/lib/supabase/server";

const paymentMethods = ["zelle", "cash", "check", "other"] as const;

const requestSchema = z.object({
  member_id: z.string().uuid(),
  transaction_date: z.iso.date(),
  transaction_type: z.enum(BOARD_TRANSACTION_TYPES),
  amount: z.string().trim().min(1),
  adjustment_direction: z
    .enum(["member_owes_cafla", "cafla_owes_member"])
    .nullable()
    .optional(),
  description: z.string().trim().min(1).max(500),
  internal_notes: z.string().trim().max(2000).nullable().optional(),
  payment_method: z.enum(paymentMethods).nullable().optional(),
  idempotency_key: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    await requireBoardApi();
    const parsed = requestSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return safeFinanceError(
        "Check the transaction details and try again.",
        400,
      );

    const body = parsed.data;
    let entry: ReturnType<typeof resolveBoardTransactionEntry>;
    try {
      entry = resolveBoardTransactionEntry({
        transactionType: body.transaction_type,
        amount: body.amount,
        paymentMethod: body.payment_method,
        adjustmentDirection: body.adjustment_direction,
      });
    } catch (error) {
      return safeFinanceError(
        error instanceof Error
          ? error.message
          : "Check the transaction amount.",
        400,
      );
    }
    const supabase = await supabaseServer();
    const memberCheck = await supabase
      .from("members")
      .select("id")
      .eq("id", body.member_id)
      .maybeSingle();
    if (memberCheck.error) throw memberCheck.error;
    if (!memberCheck.data) return safeFinanceError("Member not found.", 404);

    const { data, error } = await supabase
      .schema("finance")
      .rpc("record_transaction", {
        p_member_id: body.member_id,
        p_transaction_date: body.transaction_date,
        p_transaction_type: body.transaction_type,
        p_amount_cents: entry.amountCents.toString(),
        p_description: body.description,
        p_payment_method: entry.paymentMethod,
        p_internal_notes: body.internal_notes || null,
        p_match_id: null,
        p_source_type: null,
        p_source_id: null,
        p_idempotency_key: body.idempotency_key,
        p_metadata: {},
      });
    if (error) return financeCommandError(error, "record");

    revalidatePath("/admin/finance");
    revalidatePath(`/admin/finance/members/${body.member_id}`);
    revalidatePath("/portal/finances");

    return NextResponse.json(
      { success: true, transaction: selectTransaction(data) },
      { status: 201 },
    );
  } catch (error) {
    return authorizationOrUnexpectedFinanceError(error, "record transaction");
  }
}

function selectTransaction(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  return {
    id: row.id,
    member_id: row.member_id,
    transaction_date: row.transaction_date,
    transaction_type: row.transaction_type,
    amount_cents: row.amount_cents,
    description: row.description,
    payment_method: row.payment_method,
    created_at: row.created_at,
  };
}
