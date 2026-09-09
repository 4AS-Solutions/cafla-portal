import { NextResponse } from "next/server"
import { z } from "zod"
import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { getAdminClosingPreview } from "@/src/lib/finance/admin-queries"
import { authorizationOrUnexpectedFinanceError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { isValidMonthEnd } from "@/src/lib/finance/dates"

const schema = z.object({ period_end: z.iso.date(), preview_cutoff: z.iso.datetime({ offset: true }).optional() })
export async function POST(request: Request) {
  try {
    await requireBoardApi()
    const parsed = schema.safeParse(await request.json().catch(() => null))
    if (!parsed.success || !isValidMonthEnd(parsed.data?.period_end ?? "")) return safeFinanceError("Select a valid month-end period.", 400)
    const cutoff = parsed.data.preview_cutoff ?? new Date().toISOString()
    const result = await getAdminClosingPreview(parsed.data.period_end, cutoff)
    if (result.status === "error") return safeFinanceError(result.message, 500)
    return NextResponse.json({ success: true, preview: result.data })
  } catch (error) { return authorizationOrUnexpectedFinanceError(error, "preview closing") }
}
