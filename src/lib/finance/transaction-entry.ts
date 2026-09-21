import { parseUsdToCents } from "./money";
import type { FinancePaymentMethod, FinanceTransactionType } from "./types";

export const BOARD_TRANSACTION_TYPES = [
  "payment",
  "annual_membership_fee",
  "manual_charge",
  "manual_credit",
  "adjustment",
] as const satisfies readonly FinanceTransactionType[];

export type BoardTransactionType = (typeof BOARD_TRANSACTION_TYPES)[number];
export type AdjustmentDirection = "member_owes_cafla" | "cafla_owes_member";

export const BOARD_TRANSACTION_OPTIONS: ReadonlyArray<{
  value: BoardTransactionType;
  label: string;
}> = [
  { value: "payment", label: "Payment" },
  { value: "annual_membership_fee", label: "Annual Membership Fee" },
  { value: "manual_charge", label: "Charge" },
  { value: "manual_credit", label: "Credit" },
  { value: "adjustment", label: "Adjustment" },
];

export function getDefaultBoardTransactionDescription(
  type: BoardTransactionType,
): string {
  if (type === "annual_membership_fee") {
    const year = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: "America/Los_Angeles",
    }).format(new Date());
    return `${year} Annual Membership Fee`;
  }
  return {
    payment: "Payment received",
    manual_charge: "Manual charge",
    manual_credit: "Manual credit",
    adjustment: "Balance adjustment",
  }[type];
}

export function boardTransactionIncreasesBalance(
  type: BoardTransactionType,
  direction?: AdjustmentDirection | null,
): boolean | null {
  if (type === "adjustment" && !direction) return null;
  return (
    type === "payment" ||
    type === "manual_credit" ||
    direction === "cafla_owes_member"
  );
}

export function resolveBoardTransactionEntry(input: {
  transactionType: BoardTransactionType;
  amount: string;
  paymentMethod?: FinancePaymentMethod | null;
  adjustmentDirection?: AdjustmentDirection | null;
}) {
  const enteredCents = parseUsdToCents(input.amount);
  if (enteredCents <= BigInt(0))
    throw new Error("Amount must be greater than zero.");

  if (input.transactionType === "payment" && !input.paymentMethod) {
    throw new Error("Payment method is required for payments.");
  }
  if (input.transactionType !== "payment" && input.paymentMethod) {
    throw new Error("Payment method is only allowed for payments.");
  }
  if (input.transactionType === "adjustment" && !input.adjustmentDirection) {
    throw new Error("Choose the adjustment direction.");
  }
  if (input.transactionType !== "adjustment" && input.adjustmentDirection) {
    throw new Error("Adjustment direction is only allowed for adjustments.");
  }

  const positive =
    input.transactionType === "payment" ||
    input.transactionType === "manual_credit" ||
    input.adjustmentDirection === "cafla_owes_member";

  return {
    amountCents: positive ? enteredCents : -enteredCents,
    paymentMethod:
      input.transactionType === "payment"
        ? (input.paymentMethod ?? null)
        : null,
  };
}
