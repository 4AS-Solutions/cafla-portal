import { FinanceBadge as Badge } from "./FinanceBadge";
import {
  formatFinanceDate,
  formatFinanceDateRange,
  formatFinanceDateTime,
} from "@/src/lib/finance/dates";
import {
  formatUsdFromCents,
  getAdminBalanceMeaningLabel,
  getPaymentMethodLabel,
  getTransactionTypeLabel,
} from "@/src/lib/finance/money";
import type { AdminFinanceTransaction } from "@/src/lib/finance/types";
import { ReverseTransactionDialog } from "./ReverseTransactionDialog";

export function AdminMemberStatement({
  rows,
}: {
  rows: AdminFinanceTransaction[];
}) {
  if (rows.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-10 text-center">
        <p className="font-medium text-gray-300">No financial activity</p>
        <p className="mt-1 text-sm text-gray-500">
          This member does not yet have a Finance ledger account.
        </p>
      </div>
    );

  const reversedTransactionIds = new Set(
    rows.flatMap((row) =>
      row.reversal_of_transaction_id ? [row.reversal_of_transaction_id] : [],
    ),
  );

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <article
          key={row.id}
          className="rounded-2xl border border-white/10 bg-[#0B0F0F]/70 p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-white">{row.description}</h3>
                <Badge variant="secondary">
                  {getTransactionTypeLabel(row.transaction_type)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                {formatFinanceDate(row.transaction_date)} · recorded{" "}
                {formatFinanceDateTime(row.created_at)}
              </p>
            </div>
            <p className="text-xl font-semibold text-white">
              {formatUsdFromCents(row.amount_cents, { showPositiveSign: true })}
            </p>
          </div>
          <dl className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Payment method"
              value={getPaymentMethodLabel(row.payment_method)}
            />
            <Detail
              label="Created by"
              value={
                row.creator
                  ? `${row.creator.full_name} (${row.creator.email})`
                  : "Board user unavailable"
              }
            />
            <Detail label="Internal notes" value={row.internal_notes} />
            <Detail label="Reversal reason" value={row.reversal_reason} />
          </dl>
          <ArbiterPostingSummary row={row} />
          {(row.source_type ||
            row.source_id ||
            row.reversal_of_transaction_id ||
            Object.keys(row.metadata ?? {}).length > 0) && (
            <details className="mt-4 border-t border-white/10 pt-3">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200">
                Technical details
              </summary>
              <dl className="mt-3 grid gap-2 text-xs text-gray-400">
                <Detail label="Source type" value={row.source_type} />
                <Detail label="Source ID" value={row.source_id} />
                <Detail
                  label="Reverses transaction ID"
                  value={row.reversal_of_transaction_id}
                />
                <Detail label="Created by ID" value={row.created_by} />
              </dl>
              {Object.keys(row.metadata ?? {}).length > 0 && (
                <pre className="mt-3 overflow-x-auto rounded-xl bg-black/30 p-3 text-xs text-gray-400">
                  {JSON.stringify(row.metadata, null, 2)}
                </pre>
              )}
            </details>
          )}
          {row.transaction_type !== "reversal" &&
            !reversedTransactionIds.has(row.id) && (
              <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
                <ReverseTransactionDialog transaction={row} />
              </div>
            )}
        </article>
      ))}
    </div>
  );
}

export function StatementBalance({ value }: { value: bigint | null }) {
  if (value === null)
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
          Current balance
        </p>
        <p className="mt-2 text-xl font-semibold text-gray-300">
          No financial activity
        </p>
        <p className="mt-1 text-sm text-gray-500">
          No ledger row exists for this member.
        </p>
      </div>
    );
  return (
    <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.05] p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-yellow-400/80">
        Current balance
      </p>
      <p className="mt-2 text-3xl font-semibold text-white">
        {formatUsdFromCents(value, { showPositiveSign: true })}
      </p>
      <p className="mt-1 text-sm text-gray-300">
        {getAdminBalanceMeaningLabel(value)}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-gray-300">{value}</dd>
    </div>
  );
}

function ArbiterPostingSummary({ row }: { row: AdminFinanceTransaction }) {
  const metadata = row.metadata ?? {};
  if (
    row.source_type !== "arbiter_fee_import" &&
    metadata.source !== "arbiter_import"
  )
    return null;
  const assignments = Array.isArray(metadata.assignments)
    ? metadata.assignments.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object",
      )
    : [];
  const start =
    typeof metadata.period_start === "string" ? metadata.period_start : null;
  const end =
    typeof metadata.period_end === "string" ? metadata.period_end : null;
  return (
    <section className="mt-4 rounded-xl border border-yellow-400/10 bg-yellow-400/[0.035] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300/80">
        Arbiter fee summary
      </p>
      <p className="mt-1 text-sm text-gray-300">
        Assignments from {formatFinanceDateRange(start, end)} ·{" "}
        {String(metadata.center_count ?? 0)} Center ·{" "}
        {String(metadata.ar_count ?? 0)} AR · Gross{" "}
        {formatUsdFromCents(String(metadata.gross_earnings_cents ?? 0))}
      </p>
      {assignments.length > 0 && (
        <div className="mt-3 space-y-2">
          {assignments.map((assignment, index) => (
            <div
              key={`${String(assignment.arbiter_game_id ?? index)}-${String(assignment.role ?? index)}`}
              className="grid gap-1 rounded-lg bg-black/20 px-3 py-2 text-xs text-gray-400 sm:grid-cols-[1fr_auto_auto]"
            >
              <span>
                {typeof assignment.match_date === "string"
                  ? formatFinanceDate(assignment.match_date)
                  : "Date unavailable"}{" "}
                · {roleLabel(assignment.role)}
                {assignment.division ? ` · ${String(assignment.division)}` : ""}
                {assignment.bill_to
                  ? ` · Bill-To: ${String(assignment.bill_to)}`
                  : ""}
              </span>
              <span>
                Gross{" "}
                {formatUsdFromCents(
                  String(assignment.gross_earnings_cents ?? 0),
                )}
              </span>
              <span className="text-yellow-200">
                Fee {formatUsdFromCents(String(assignment.fee_cents ?? 0))}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function roleLabel(value: unknown) {
  return value === "center"
    ? "Center"
    : value === "ar1"
      ? "AR1"
      : value === "ar2"
        ? "AR2"
        : "Assignment";
}
