import { User } from "@supabase/supabase-js"
import { supabaseServer } from "../supabase/server"

type ProfileResult = {
  user: User
  profile: any
} | null;

export async function getProfile(): Promise<ProfileResult> {

  const supabase = await supabaseServer()

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