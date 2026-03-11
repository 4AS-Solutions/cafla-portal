import { createClient } from "@/src/lib/supabase/server"

export async function getQuizzes() {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      id,
      title,
      description,
      open_from,
      open_until,
      time_limit_minutes
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getQuizzes error", error)
    throw error
  }

  return data ?? []
}