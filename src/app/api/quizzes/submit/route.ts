import { NextResponse } from "next/server"
import { createClient } from "@/src/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { quiz_id, answers } = body

  const { data: existing } = await supabase
    .from("quiz_attempts")
    .select("id")
    .eq("quiz_id", quiz_id)
    .eq("member_id", user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: "Quiz already submitted" },
      { status: 400 }
    )
  }

  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quiz_id)

  if (questionsError || !questions || questions.length === 0) {
    console.error(questionsError)
    return NextResponse.json(
      { error: "Quiz questions not found" },
      { status: 500 }
    )
  }

  let correct = 0

  for (const q of questions) {
    if (answers[q.id] === q.correct_answer) {
      correct++
    }
  }

  const score = Math.round((correct / questions.length) * 100)

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      member_id: user.id,
      quiz_id,
      score
    })
    .select("id")
    .single()

  if (attemptError || !attempt) {
    console.error(attemptError)
    return NextResponse.json(
      { error: "Failed to save attempt" },
      { status: 500 }
    )
  }

  const answersInsert = Object.entries(answers).map(
    ([question_id, selected_answer]) => ({
      attempt_id: attempt.id,
      question_id,
      selected_answer
    })
  )

  const { error: answersInsertError } = await supabase
    .from("quiz_answers")
    .insert(answersInsert)

  if (answersInsertError) {
    console.error(answersInsertError)
    return NextResponse.json(
      { error: "Failed to save quiz answers" },
      { status: 500 }
    )
  }

  return NextResponse.json({ score })
}