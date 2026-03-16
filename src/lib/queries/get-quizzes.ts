import { createClient } from "@/src/lib/supabase/server"

export async function getQuizzes() {

  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase

    .from("quizzes")

    .select(`
      id,
      title,
      description,
      open_from,
      open_until,
      time_limit_minutes,

      quiz_attempts (
        id,
        score
      )
    `)

    .eq("quiz_attempts.member_id", user.id)

  if (error) {
    console.error(error)
    return []
  }

  return data.map((quiz) => ({
    ...quiz,
    attempt_id: quiz.quiz_attempts?.[0]?.id || null,
    score: quiz.quiz_attempts?.[0]?.score || null
  }))
}