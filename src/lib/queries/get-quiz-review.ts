import { createClient } from "@/src/lib/supabase/server"

export async function getQuizReview(attemptId: string) {
  const supabase = await createClient()

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .select(`
      id,
      score,
      quizzes (
        id,
        title
      )
    `)
    .eq("id", attemptId)
    .single()

  if (attemptError || !attempt) {
    console.error("quiz review attempt error", attemptError)
    throw new Error("Quiz attempt not found")
  }

  const quizRelation = Array.isArray(attempt.quizzes)
    ? attempt.quizzes[0]
    : attempt.quizzes

  if (!quizRelation?.id) {
    throw new Error("Quiz not found for this attempt")
  }

  const { data: answers, error: answersError } = await supabase
    .from("quiz_answers")
    .select(`
      question_id,
      selected_answer
    `)
    .eq("attempt_id", attemptId)

  if (answersError) {
    console.error("quiz review answers error", answersError)
    throw answersError
  }

  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizRelation.id)

  if (questionsError) {
    console.error("quiz review questions error", questionsError)
    throw questionsError
  }

  return {
    attempt: {
      ...attempt,
      quizzes: quizRelation,
    },
    answers: answers ?? [],
    questions: questions ?? [],
  }
}