import { createClient } from "@/src/lib/supabase/server"

export async function getQuizHistory() {

  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select(`
      id,
      score,
      completed_at,
      quizzes (
        id,
        title
      )
    `)
    .eq("member_id", user.id)
    .order("completed_at", { ascending: false })

  if (error) {
    console.error("quiz history error", error)
    throw error
  }

  return data ?? []
}