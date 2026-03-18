import { createClient } from "@/src/lib/supabase/server"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const supabase = await createClient()
  const { status } = await req.json()

  const { error } = await supabase
    .from("match_reports")
    .update({ status })
    .eq("id", id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}