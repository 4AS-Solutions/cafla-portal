import { createClient } from "@/src/lib/supabase/server"

export async function getMemberById(memberId: string) {
  console.log(memberId)

  const supabase = await createClient()

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