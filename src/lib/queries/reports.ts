import { createClient } from "@/src/lib/supabase/server"

export async function getMatchForReport(matchId: string) {

  console.log("matcID: " , matchId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .maybeSingle()

  console.log("data: ", data);

  if (error) {
    console.error(error)
    throw error
  }

  return data
}