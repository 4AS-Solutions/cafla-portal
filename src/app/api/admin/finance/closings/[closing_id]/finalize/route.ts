import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, financeClosingError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { supabaseServer } from "@/src/lib/supabase/server"
export async function POST(_:Request,{params}:{params:Promise<{closing_id:string}>}){try{await requireBoardApi();const{id}= {id:(await params).closing_id};if(!z.string().uuid().safeParse(id).success)return safeFinanceError("Invalid closing ID.",400);const s=await supabaseServer();const{data,error}=await s.schema("finance").rpc("finalize_monthly_closing",{p_closing_id:id});if(error)return financeClosingError(error);revalidatePath("/admin/finance");revalidatePath("/portal/finances");return NextResponse.json({success:true,closing:data})}catch(e){return authorizationOrUnexpectedFinanceError(e,"finalize closing")}}
