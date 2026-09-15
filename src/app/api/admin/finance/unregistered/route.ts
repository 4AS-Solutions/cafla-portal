import { NextResponse } from "next/server"
import { z } from "zod"
import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { normalizeArbiterName } from "@/src/lib/finance/arbiter-fees/matching"
import { supabaseServer } from "@/src/lib/supabase/server"

const schema=z.object({display_name:z.string().trim().min(1).max(300),arbiter_name:z.string().trim().min(1).max(300).optional()})
export async function POST(request:Request){try{await requireBoardApi();const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return safeFinanceError("Enter a valid display name.",400);const db=await supabaseServer();const{data,error}=await db.schema("finance").rpc("create_unregistered_referee",{p_display_name:parsed.data.display_name,p_normalized_name:normalizeArbiterName(parsed.data.display_name),p_arbiter_name:parsed.data.arbiter_name??null,p_normalized_arbiter_name:parsed.data.arbiter_name?normalizeArbiterName(parsed.data.arbiter_name):null});if(error)return safeFinanceError(error.code==="23505"?"This Arbiter name is already mapped.":"Unable to create the pending financial account.",error.code==="23505"?409:500);return NextResponse.json({success:true,unregistered:data},{status:201})}catch(error){return authorizationOrUnexpectedFinanceError(error,"create unregistered financial identity")}}
