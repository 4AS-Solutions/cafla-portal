import { NextResponse } from "next/server"
import { z } from "zod"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { getArbiterFeeImport } from "@/src/lib/finance/arbiter-fees/server"

export async function GET(_: Request, { params }: { params: Promise<{ import_id: string }> }) {
  try {
    await requireBoardApi()
    const id = (await params).import_id
    if (!z.string().uuid().safeParse(id).success) return safeFinanceError("Invalid import ID.", 400)
    return NextResponse.json({ success: true, ...(await getArbiterFeeImport(id)) })
  } catch (error) {
    return authorizationOrUnexpectedFinanceError(error, "load Arbiter fee import")
  }
}
