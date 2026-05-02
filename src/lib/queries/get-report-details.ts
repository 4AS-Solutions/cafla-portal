import { supabaseServer } from "@/src/lib/supabase/server"
import { getMatchDetails } from "./get-match-details"

export async function getReportDetails(matchId: string) {

  // 2️⃣ Reusar tu lógica existente 🔥
  const details = await getMatchDetails(matchId)

  return details;
}