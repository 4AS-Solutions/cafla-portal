"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  formatFinanceDate,
  getTodayInLosAngeles,
} from "@/src/lib/finance/dates";
import {
  formatUsdFromCents,
  getTransactionTypeLabel,
  parseUsdToCents,
} from "@/src/lib/finance/money";
import {
  BOARD_TRANSACTION_OPTIONS,
  boardTransactionIncreasesBalance,
  getDefaultBoardTransactionDescription,
  type AdjustmentDirection,
  type BoardTransactionType,
} from "@/src/lib/finance/transaction-entry";

type Row = Record<string, unknown>;
type Command = (url: string, body: object) => Promise<boolean>;

export function PendingRecordTransactionDialog({
  account,
  balance,
  pending,
  command,
}: {
  account: Row;
  balance: bigint;
  pending: boolean;
  command: Command;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<BoardTransactionType>("payment");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState(
    getDefaultBoardTransactionDescription("payment"),
  );
  const [direction, setDirection] = useState<AdjustmentDirection | "">("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const id = String(account.id);
  const name = String(account.display_name);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await command("/api/admin/finance/unregistered/transactions", {
      unregistered_referee_id: id,
      transaction_date: form.get("transaction_date"),
      transaction_type: type,
      amount,
      description,
      internal_notes: form.get("internal_notes") || null,
      payment_method: type === "payment" ? form.get("payment_method") : null,
      adjustment_direction: type === "adjustment" ? direction : null,
      idempotency_key: idempotencyKey,
    });
    if (ok) {
      setOpen(false);
      setIdempotencyKey("");
    }
  }

  function handleOpenChange(next: boolean) {
    if (pending) return;
    if (next && !open) setIdempotencyKey(crypto.randomUUID());
    setOpen(next);
  }

  const preview = transactionPreview(type, amount, direction, name);
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={pending} className={primaryButton}>
          Record Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogDescription>
            Record financial activity for {name}. Current balance:{" "}
            {formatUsdFromCents(balance, { showPositiveSign: true })}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Transaction type">
              <select
                value={type}
                onChange={(event) => {
                  const next = event.target.value as BoardTransactionType;
                  setType(next);
                  setDescription(getDefaultBoardTransactionDescription(next));
                  setDirection("");
                }}
                className={selectClass}
              >
                {BOARD_TRANSACTION_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Amount (USD)">
              <Input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                placeholder="34.00"
                required
                autoComplete="off"
              />
            </Field>
            <Field label="Transaction date">
              <Input
                name="transaction_date"
                type="date"
                required
                defaultValue={getTodayInLosAngeles()}
              />
            </Field>
            {type === "payment" && (
              <Field label="Payment method">
                <select
                  name="payment_method"
                  required
                  defaultValue=""
                  className={selectClass}
                >
                  <option value="" disabled>
                    Select method
                  </option>
                  <option value="zelle">Zelle</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            )}
            {type === "adjustment" && (
              <Field label="Adjustment direction">
                <select
                  required
                  value={direction}
                  onChange={(event) =>
                    setDirection(event.target.value as AdjustmentDirection)
                  }
                  className={selectClass}
                >
                  <option value="" disabled>
                    Select direction
                  </option>
                  <option value="cafla_owes_member">Increase balance</option>
                  <option value="member_owes_cafla">Decrease balance</option>
                </select>
              </Field>
            )}
          </div>
          <Field label="Description">
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              maxLength={500}
            />
          </Field>
          <Field label="Internal notes" hint="Board only">
            <Textarea
              name="internal_notes"
              maxLength={2000}
              placeholder="Optional internal context"
            />
          </Field>
          <div className="rounded-xl border border-yellow-400/15 bg-yellow-400/[0.05] p-4">
            <p className="font-medium text-white">{preview.title}</p>
            <p className="mt-1 text-sm text-gray-300">{preview.explanation}</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className={secondaryButton}
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || !preview.valid}
              className={primaryButton}
            >
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "Recording..." : "Record Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PendingReverseTransactionDialog({
  transaction,
  accountName,
  pending,
  command,
}: {
  transaction: Row;
  accountName: string;
  pending: boolean;
  command: Command;
}) {
  const [open, setOpen] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const amount = BigInt(String(transaction.amount_cents));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await command(
      `/api/admin/finance/unregistered/transactions/${String(transaction.id)}/reverse`,
      {
        transaction_date: form.get("transaction_date"),
        description: `Reversal: ${String(transaction.description)}`,
        reversal_reason: form.get("reversal_reason"),
        idempotency_key: idempotencyKey,
      },
    );
    if (ok) {
      setOpen(false);
      setIdempotencyKey("");
    }
  }
  function handleOpenChange(next: boolean) {
    if (pending) return;
    if (next && !open) setIdempotencyKey(crypto.randomUUID());
    setOpen(next);
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          className={secondaryButton}
        >
          <RotateCcw />
          Reverse
        </Button>
      </DialogTrigger>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>Reverse Transaction</DialogTitle>
          <DialogDescription>
            This creates an opposite entry for {accountName}. The original
            transaction remains in Financial History.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="font-medium text-white">
            {String(transaction.description)}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {formatFinanceDate(String(transaction.transaction_date))} ·{" "}
            {getTransactionTypeLabel(
              String(transaction.transaction_type) as never,
            )}
          </p>
          <p className="mt-3 text-xl font-semibold text-white">
            {formatUsdFromCents(amount, { showPositiveSign: true })}
          </p>
          <p className="mt-1 text-sm text-yellow-200">
            The reversal will add{" "}
            {formatUsdFromCents(-amount, { showPositiveSign: true })}.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <Field label="Reversal date">
            <Input
              name="transaction_date"
              type="date"
              required
              defaultValue={getTodayInLosAngeles()}
            />
          </Field>
          <Field label="Reversal reason" hint="Required · Board only">
            <Textarea name="reversal_reason" required maxLength={1000} />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className={secondaryButton}
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="border border-red-400/30 bg-red-500/15 text-red-100 hover:bg-red-500/25 focus-visible:ring-red-400/50"
            >
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "Reversing..." : "Reverse Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LinkPendingFinancialAccountDialog({
  account,
  balance,
  member,
  pending,
  command,
}: {
  account: Row;
  balance: bigint;
  member: Row;
  pending: boolean;
  command: Command;
}) {
  const [open, setOpen] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  async function link() {
    const ok = await command(
      `/api/admin/finance/unregistered/${String(account.id)}/link`,
      { member_id: String(member.id), idempotency_key: idempotencyKey },
    );
    if (ok) {
      setOpen(false);
      setIdempotencyKey("");
    }
  }
  function handleOpenChange(next: boolean) {
    if (pending) return;
    if (next && !open) setIdempotencyKey(crypto.randomUUID());
    setOpen(next);
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          className={secondaryButton}
        >
          Link to Member
        </Button>
      </DialogTrigger>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>Link Pending Financial Account</DialogTitle>
          <DialogDescription>
            This action is permanent and migrates the complete financial history
            to the selected member.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryCard
            label="Pending account"
            primary={String(account.display_name)}
            secondary={`Balance ${formatUsdFromCents(balance, { showPositiveSign: true })}`}
          />
          <SummaryCard
            label="Destination member"
            primary={String(member.full_name)}
            secondary={String(member.email)}
          />
        </div>
        <p className="rounded-xl border border-yellow-400/15 bg-yellow-400/[0.05] p-4 text-sm text-gray-300">
          This will permanently link this pending financial account to the
          selected CAFLA member and migrate its financial history to the
          member&apos;s official Finance account.
        </p>
        <DialogFooter>
          <Button
            variant="ghost"
            className={secondaryButton}
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className={primaryButton}
            disabled={pending}
            onClick={() => void link()}
          >
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Linking..." : "Confirm Permanent Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function transactionPreview(
  type: BoardTransactionType,
  amount: string,
  direction: AdjustmentDirection | "",
  name: string,
) {
  let cents: bigint;
  try {
    cents = parseUsdToCents(amount);
    if (cents <= BigInt(0)) throw new Error();
  } catch {
    return {
      valid: false,
      title: "Enter an amount",
      explanation: "Use a dollar amount such as 34.00.",
    };
  }
  const increase = boardTransactionIncreasesBalance(type, direction || null);
  return {
    valid: increase !== null,
    title: `${BOARD_TRANSACTION_OPTIONS.find((item) => item.value === type)?.label} · ${formatUsdFromCents(cents)}`,
    explanation:
      increase === true
        ? `This will increase ${name}'s balance by ${formatUsdFromCents(cents)}.`
        : increase === false
          ? `This will decrease ${name}'s balance by ${formatUsdFromCents(cents)}.`
          : "Choose whether this adjustment increases or decreases the balance.",
  };
}
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label>{label}</Label>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
function SummaryCard({
  label,
  primary,
  secondary,
}: {
  label: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-medium text-white">{primary}</p>
      <p className="text-sm text-gray-400">{secondary}</p>
    </div>
  );
}
const dialogClass =
  "max-h-[92vh] overflow-y-auto border-white/10 bg-[#07100E] text-white sm:max-w-xl";
const selectClass =
  "flex h-9 w-full rounded-md border border-white/10 bg-[#07100E] px-2.5 text-sm text-white outline-none focus:border-yellow-400/50 focus-visible:ring-2 focus-visible:ring-yellow-400/30";
const primaryButton =
  "bg-yellow-400 text-black hover:bg-yellow-300 active:bg-yellow-500 focus-visible:ring-yellow-400/60 disabled:bg-yellow-400/30 disabled:text-black/50";
const secondaryButton =
  "border border-emerald-900/60 bg-[#07100E] text-gray-200 hover:border-yellow-400/50 hover:bg-emerald-950/60 hover:text-yellow-200 active:bg-emerald-950 focus-visible:ring-yellow-400/50 disabled:border-white/10 disabled:text-gray-600";
