import { NextResponse } from "next/server"
import { createClient } from "@/src/lib/supabase/server"
import { getProfile } from "@/src/lib/queries/get-profile"

export async function POST(req: Request) {

  const data = await getProfile()

  if (!data?.profile || data.profile.role !== "board") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const profile = data.profile

  const supabase = await createClient()

  const body = await req.json()

  const {
    title,
    description,
    open_from,
    open_until,
    time_limit_minutes,
    questions
  } = body

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      title,
      description,
      open_from,
      open_until,
      time_limit_minutes,
      created_by: profile.id
    })
    .select()
    .single()

  if (quizError) {
    console.error(quizError)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }

  const questionsInsert = questions.map((q: any) => ({
    quiz_id: quiz.id,
    ...q
  }))

  const { error: questionError } = await supabase
    .from("quiz_questions")
    .insert(questionsInsert)

  if (questionError) {
    console.error(questionError)
    return NextResponse.json({ error: "Failed to save questions" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}