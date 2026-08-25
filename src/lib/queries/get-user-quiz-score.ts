import "server-only"

import { getUser } from "@/src/lib/auth/get-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type UserQuizScore = {
  cycle_id: string
  member_id: string
  full_name: string
  assessments_counted: number
  assessments_not_attempted: number
  quiz_score: number
}

type QuizScoreRow = Omit<
  UserQuizScore,
  "assessments_counted" | "assessments_not_attempted" | "quiz_score"
> & {
  assessments_counted: number | string | null
  assessments_not_attempted: number | string | null
  quiz_score: number | string | null
}

export async function getUserQuizScore(): Promise<UserQuizScore | null> {
  const user = await getUser()

  if (!user) throw new Error("Unauthorized")

  const supabaseAdmin = getSupabaseAdmin()
  const { data: activeCycle, error: activeCycleError } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select("id")
    .eq("status", "active")
    .maybeSingle()

  if (activeCycleError) {
    console.error("[QUIZ V2] Unable to load the active development cycle:", activeCycleError)
    throw new Error("Unable to load the active development cycle.")
  }

  if (!activeCycle) return null

  const { data, error } = await supabaseAdmin
    .schema("development")
    .from("referee_quiz_score")
    .select(`
      cycle_id,
      member_id,
      full_name,
      assessments_counted,
      assessments_not_attempted,
      quiz_score
    `)
    .eq("cycle_id", activeCycle.id)
    .eq("member_id", user.id)
    .maybeSingle()

  if (error) {
    console.error("[QUIZ V2] Unable to load the referee quiz score:", error)
    throw new Error("Unable to load the referee quiz score.")
  }

  if (!data) return null

  const row = data as QuizScoreRow

  if (row.quiz_score === null) return null

  return {
    cycle_id: row.cycle_id,
    member_id: row.member_id,
    full_name: row.full_name,
    assessments_counted: Number(row.assessments_counted ?? 0),
    assessments_not_attempted: Number(row.assessments_not_attempted ?? 0),
    quiz_score: Number(row.quiz_score),
  }
}
