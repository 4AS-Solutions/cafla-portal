import { NextResponse } from "next/server"
import { z } from "zod"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { supabaseServer } from "@/src/lib/supabase/server"

const schema = z.object({ arbiter_name: z.string().trim().min(1).max(300), member_id: z.string().uuid() })

export async function POST(request: Request) {
  try {
    await requireBoardApi()
    const parsed = schema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return safeFinanceError("Check the Arbiter mapping.", 400)
    const db = await supabaseServer()
    const { data, error } = await db.rpc("confirm_arbiter_referee_mapping", { p_arbiter_name: parsed.data.arbiter_name, p_member_id: parsed.data.member_id })
    if (error) {
      console.error("[FINANCE] Unable to confirm Arbiter mapping:", error)
      return safeFinanceError(error.code === "42501" ? "Board access is required." : "Unable to save the Arbiter mapping.", error.code === "42501" ? 403 : 500)
    }
    return NextResponse.json({ success: true, mapping: data })
  } catch (error) {
    return authorizationOrUnexpectedFinanceError(error, "confirm Arbiter mapping")
  }
}
