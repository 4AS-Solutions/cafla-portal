import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { authorizationOrUnexpectedFinanceError, safeFinanceError } from "@/src/lib/finance/api-responses"
import { supabaseServer } from "@/src/lib/supabase/server"
const schema=z.object({member_id:z.string().uuid(),idempotency_key:z.string().uuid()})
export async function POST(request:Request,{params}:{params:Promise<{unregistered_id:string}>}){try{await requireBoardApi();const id=(await params).unregistered_id;const p=schema.safeParse(await request.json().catch(()=>null));if(!z.string().uuid().safeParse(id).success||!p.success)return safeFinanceError("Choose a valid destination member.",400);const db=await supabaseServer();const{data,error}=await db.schema("finance").rpc("link_unregistered_referee",{p_unregistered_referee_id:id,p_member_id:p.data.member_id,p_idempotency_key:p.data.idempotency_key});if(error)return safeFinanceError(error.code==="23505"?"This identity or member is already linked.":"Unable to link the pending financial account.",error.code==="23505"?409:500);revalidatePath("/admin/finance");revalidatePath("/portal/finances");return NextResponse.json({success:true,result:data})}catch(error){return authorizationOrUnexpectedFinanceError(error,"link unregistered financial identity")}}
