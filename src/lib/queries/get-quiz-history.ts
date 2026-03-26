import { supabaseServer } from "@/src/lib/supabase/server"

export async function getQuizHistory() {

  const supabase = await supabaseServer()

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
        title,
        quiz_questions (
          id
        )
      )
    `)
    .eq("member_id", user.id)
    .order("completed_at", { ascending: false })

  if (error) {
    console.error("quiz history error", error)
    throw error
  }

  // 👉 transformamos para agregar total_questions
  const formatted = data?.map((attempt: any) => ({

    ...attempt,

    total_questions: attempt.quizzes.quiz_questions.length

  }))

  return formatted ?? []
}