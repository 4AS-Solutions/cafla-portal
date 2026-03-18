import { createClient } from "@/src/lib/supabase/server"

export async function GET() {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_at", { ascending: true })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ matches: data })
}