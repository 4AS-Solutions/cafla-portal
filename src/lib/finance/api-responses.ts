import "server-only"

import { NextResponse } from "next/server"

export function safeFinanceError(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status })
}

export function financeCommandError(error: { code?: string; message?: string }, operation: "record" | "reverse") {
  console.error(`[FINANCE] Unable to ${operation} transaction:`, error)
  if (error.code === "23505") return safeFinanceError(operation === "reverse" ? "This transaction has already been reversed or this request was already processed." : "This transaction request was already processed.", 409)
  if (error.code === "23503") return safeFinanceError(operation === "reverse" ? "Original transaction not found." : "Member not found.", 404)
  if (error.code === "42501") return safeFinanceError("Board access is required.", 403)
  if (operation === "reverse" && error.message?.includes("does not exist")) return safeFinanceError("Original transaction not found.", 404)
  if (operation === "reverse" && error.message?.includes("cannot reverse")) return safeFinanceError("This transaction cannot be reversed.", 409)
  return safeFinanceError(`Unable to ${operation} the transaction.`, 500)
}

export function authorizationOrUnexpectedFinanceError(error: unknown, operation: string) {
  const message = error instanceof Error ? error.message : ""
  if (message === "Unauthorized" || message === "NEXT_REDIRECT") return safeFinanceError("Authentication is required.", 401)
  if (message === "Forbidden") return safeFinanceError("Board access is required.", 403)
  console.error(`[FINANCE] Unexpected ${operation} failure:`, error)
  return safeFinanceError("Unexpected Finance error.", 500)
}

export function financeClosingError(error: { code?: string; message?: string }) {
  console.error("[FINANCE] Closing command failed:", error)
  if (error.code === "42501") return safeFinanceError("Board access is required.", 403)
  if (error.message?.includes("does not exist")) return safeFinanceError("Closing not found.", 404)
  if (error.code === "23505" || error.message?.match(/draft|finalized|state|supersed/i)) return safeFinanceError("The closing state changed or conflicts with an existing version. Refresh and review the current state.", 409)
  return safeFinanceError("Unable to complete the closing operation.", 500)
}
