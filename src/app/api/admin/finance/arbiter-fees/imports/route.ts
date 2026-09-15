import { NextResponse } from "next/server"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { createArbiterFeeImport } from "@/src/lib/finance/arbiter-fees/server"

export async function POST(request: Request) {
  try {
    const board = await requireBoardApi()
    const form = await request.formData()
    const file = form.get("file")
    if (!(file instanceof File)) return safeFinanceError("Choose an Arbiter .xls or .xlsx file.", 400)
    if (file.size > 10 * 1024 * 1024) return safeFinanceError("The Arbiter file must be 10 MB or smaller.", 413)
    if (!/\.xlsx?$/i.test(file.name)) return safeFinanceError("Only .xls and .xlsx Arbiter files are supported.", 400)
    const result = await createArbiterFeeImport(file, board.id)
    return NextResponse.json({ success: true, ...result }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && /Arbiter|worksheet|workbook|formula|row limit|empty/i.test(error.message)) {
      return safeFinanceError(error.message, 400)
    }
    return authorizationOrUnexpectedFinanceError(error, "create Arbiter fee import")
  }
}
