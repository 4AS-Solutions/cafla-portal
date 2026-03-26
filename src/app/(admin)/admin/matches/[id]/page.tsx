import MatchDetail from "@/src/components/admin/MatchDetails"
import { supabaseServer } from "@/src/lib/supabase/server"

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params

  const supabase = await supabaseServer()


  const { data: match } = await supabase
    .from("matches")
    .select(`
      *,
      center_referee:members!matches_center_referee_id_fkey(id, full_name),
      ar1:members!matches_assistant_referee_1_id_fkey(id, full_name),
      ar2:members!matches_assistant_referee_2_id_fkey(id, full_name)
    `)
    .eq("id", id)
    .single()

  return (
    <MatchDetail match={match} />
  )
}