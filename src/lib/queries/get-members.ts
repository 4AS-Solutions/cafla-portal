import { createClient } from "../supabase/server"

export async function getMembers() {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("members")
    .select(`
      id,
      full_name,
      email,
      role,
      created_at
    `)
    .eq("status", "active")
    .order("full_name")

  if (error) {
    console.error("Error fetching members:", error)
    return []
  }

  return data
}