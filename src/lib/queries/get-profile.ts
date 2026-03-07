import { createClient } from "../supabase/server"

export async function getProfile() {

  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("members")
    .select("*")
    .eq("id", user.id)
    .single()

  return {
    user,
    profile
  }
}