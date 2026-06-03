import { supabaseServer } from "@/src/lib/supabase/server"

export type SimpleMember = {
  id: string
  full_name: string
}

export async function getAllMembers() {

  const supabase = await supabaseServer()

  const {
    data,
    error,
  } = await supabase
    .from("members")
    .select(`
      id,
      full_name
    `)
    .eq("status", "active")
    .order("full_name", {
      ascending: true,
    })

  if (error) {

    console.error(
      "getAllMembers error:",
      error
    )

    throw error
  }

  return (data ?? []) as SimpleMember[]
}