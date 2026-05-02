import { supabaseServer } from "@/src/lib/supabase/server"

export async function getMemberById(memberId: string) {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}