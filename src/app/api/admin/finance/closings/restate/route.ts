import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, financeClosingError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { supabaseServer } from "@/src/lib/supabase/server"
import { isValidMonthEnd } from "@/src/lib/finance/dates"
const schema=z.object({period_end:z.iso.date().refine(isValidMonthEnd),preview_cutoff:z.iso.datetime({offset:true}),restatement_reason:z.string().trim().min(1).max(1000)})
export async function POST(request:Request){try{await requireBoardApi();const p=schema.safeParse(await request.json().catch(()=>null));if(!p.success)return safeFinanceError("Check the restatement details.",400);const s=await supabaseServer();const{data,error}=await s.schema("finance").rpc("restate_monthly_closing",{p_period_end:p.data.period_end,p_restatement_reason:p.data.restatement_reason,p_ledger_cutoff_at:p.data.preview_cutoff});if(error)return financeClosingError(error);revalidatePath("/admin/finance");revalidatePath("/portal/finances");return NextResponse.json({success:true,closing:data})}catch(e){return authorizationOrUnexpectedFinanceError(e,"restate closing")}}
