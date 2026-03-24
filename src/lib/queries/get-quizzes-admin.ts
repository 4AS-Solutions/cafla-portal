import { supabaseServer } from "@/src/lib/supabase/server"

export async function getAdminQuizzes() {

  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      id,
      title,
      description,
      open_from,
      open_until,
      time_limit_minutes,
      quiz_questions(count)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error

  return data.map((q: any) => ({
    ...q,
    questions_count: q.quiz_questions?.[0]?.count || 0
  }))
}