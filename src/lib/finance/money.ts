import type {
  FinanceCents,
  FinanceTransactionType,
} from "./types"

const ZERO = BigInt(0)
const HUNDRED = BigInt(100)

export type BalanceMeaning =
  | "cafla_owes_member"
  | "member_owes_cafla"
  | "balanced"

function centsAsBigInt(value: FinanceCents): bigint {
  if (typeof value === "bigint") return value

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new Error("Finance cents must be a safe integer.")
    }

    return BigInt(value)
  }

  if (!/^-?\d+$/.test(value)) {
    throw new Error("Finance cents must contain an integer value.")
  }

  return BigInt(value)
}

export function parseUsdToCents(value: string): bigint {
  const normalized = value.trim().replace(/^\$/, "")
  const match = normalized.match(/^([+-])?(\d+)(?:\.(\d{1,2}))?$/)

  if (!match) {
    throw new Error("Enter a valid USD amount with no more than two decimal places.")
  }

  const [, sign = "+", dollars, fraction = ""] = match
  const cents = BigInt(dollars) * HUNDRED + BigInt(fraction.padEnd(2, "0"))

  return sign === "-" ? -cents : cents
}

export function formatUsdFromCents(
  value: FinanceCents,
  options: { showPositiveSign?: boolean } = {}
): string {
  const cents = centsAsBigInt(value)
  const negative = cents < ZERO
  const absolute = negative ? -cents : cents
  const dollars = absolute / HUNDRED
  const remainder = absolute % HUNDRED
  const groupedDollars = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(dollars)
  const prefix = negative
    ? "-"
    : options.showPositiveSign && cents > ZERO
      ? "+"
      : ""

  return `${prefix}$${groupedDollars}.${remainder.toString().padStart(2, "0")}`
}

export function getBalanceMeaning(value: FinanceCents): BalanceMeaning {
  const cents = centsAsBigInt(value)

  if (cents > ZERO) return "cafla_owes_member"
  if (cents < ZERO) return "member_owes_cafla"
  return "balanced"
}

export function getBalanceMeaningLabel(
  value: FinanceCents,
  options: { includeAmount?: boolean } = {}
): string {
  const cents = centsAsBigInt(value)
  const meaning = getBalanceMeaning(value)
  const amount = formatUsdFromCents(
    cents < ZERO ? -cents : cents
  )

  if (meaning === "member_owes_cafla") {
    return options.includeAmount ? `You owe CAFLA ${amount}` : "You owe CAFLA"
  }

  if (meaning === "cafla_owes_member") {
    return options.includeAmount ? `CAFLA owes you ${amount}` : "CAFLA owes you"
  }

  return "Your account is balanced"
}

export function getAdminBalanceMeaningLabel(value: FinanceCents): string {
  const meaning = getBalanceMeaning(value)

  if (meaning === "member_owes_cafla") return "Owes CAFLA"
  if (meaning === "cafla_owes_member") return "CAFLA owes member"
  return "Balanced"
}

export function getTransactionTypeLabel(type: FinanceTransactionType): string {
  const labels: Record<FinanceTransactionType, string> = {
    opening_balance: "Opening balance",
    match_fee: "Match fee",
    annual_membership_fee: "Annual membership fee",
    payment: "Payment received",
    manual_charge: "Charge",
    manual_credit: "Credit",
    adjustment: "Adjustment",
    reversal: "Reversal",
  }

  return labels[type]
}

export function getPaymentMethodLabel(method: string | null): string | null {
  if (!method) return null

  const labels: Record<string, string> = {
    zelle: "Zelle",
    cash: "Cash",
    check: "Check",
    other: "Other",
  }

  return labels[method] ?? method
}
