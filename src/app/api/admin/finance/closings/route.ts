import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, financeClosingError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { supabaseServer } from "@/src/lib/supabase/server"
import { isValidMonthEnd } from "@/src/lib/finance/dates"
const schema = z.object({ period_end: z.iso.date(), preview_cutoff: z.iso.datetime({ offset: true }) })
function isMonthEnd(value: string) { return isValidMonthEnd(value) }
export async function POST(request: Request) { try { await requireBoardApi(); const p=schema.safeParse(await request.json().catch(()=>null)); if(!p.success||!isMonthEnd(p.data?.period_end??"")) return safeFinanceError("Select a valid month-end period.",400); const s=await supabaseServer(); const {data,error}=await s.schema("finance").rpc("create_monthly_closing",{p_period_end:p.data.period_end,p_ledger_cutoff_at:p.data.preview_cutoff}); if(error)return financeClosingError(error); revalidatePath("/admin/finance"); return NextResponse.json({success:true,closing:data},{status:201}) } catch(e){return authorizationOrUnexpectedFinanceError(e,"create closing")} }
