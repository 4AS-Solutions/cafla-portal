import { createClient } from "@/src/lib/supabase/server"

export async function getQuizDetails(quizId: string) {

  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single()

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)

  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("id, score")
    .eq("quiz_id", quizId)
    .eq("member_id", user.id)
    .maybeSingle()

  return {
    quiz,
    questions,
    attempt
  }
}