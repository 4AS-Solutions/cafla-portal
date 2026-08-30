import "server-only"

import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type NullableNumeric = number | string | null

function toNullableNumber(value: NullableNumeric): number | null {
  return value === null ? null : Number(value)
}

export async function getMemberDashboard(memberId: string) {
  const supabaseAdmin = getSupabaseAdmin()
  const { data: activeCycle, error: activeCycleError } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select("id")
    .eq("status", "active")
    .maybeSingle()

  if (activeCycleError) {
    console.error(
      "[ADMIN MEMBER DETAIL V2] Unable to load the active development cycle:",
      activeCycleError
    )
    throw new Error("Unable to load the active development cycle.")
  }

  const activityPromise = supabaseAdmin
    .from("dashboard_referee_activity")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle()

  if (!activeCycle) {
    const activity = await activityPromise

    if (activity.error) {
      console.error(
        "[ADMIN MEMBER DETAIL V2] Unable to load member activity:",
        activity.error
      )
    }

    return {
      development: null,
      attendance: null,
      quiz: null,
      evaluations: null,
      reports: null,
      activity: activity.data,
    }
  }

  const [development, attendance, quiz, evaluations, reports, activity] =
    await Promise.all([
      supabaseAdmin
        .schema("development")
        .from("current_ranking_snapshot")
        .select("development_score")
        .eq("cycle_id", activeCycle.id)
        .eq("member_id", memberId)
        .maybeSingle(),
      supabaseAdmin
        .schema("development")
        .from("referee_attendance")
        .select("attendance_percentage")
        .eq("cycle_id", activeCycle.id)
        .eq("member_id", memberId)
        .maybeSingle(),
      supabaseAdmin
        .schema("development")
        .from("referee_quiz_score")
        .select("quiz_score")
        .eq("cycle_id", activeCycle.id)
        .eq("member_id", memberId)
        .maybeSingle(),
      supabaseAdmin
        .schema("development")
        .from("referee_evaluation_score")
        .select("evaluation_score")
        .eq("cycle_id", activeCycle.id)
        .eq("member_id", memberId)
        .maybeSingle(),
      supabaseAdmin
        .schema("development")
        .from("referee_report_score")
        .select("report_percentage")
        .eq("cycle_id", activeCycle.id)
        .eq("member_id", memberId)
        .maybeSingle(),
      activityPromise,
    ])

  const results = {
    development,
    attendance,
    quiz,
    evaluations,
    reports,
    activity,
  }

  for (const [metric, result] of Object.entries(results)) {
    if (result.error) {
      console.error(
        `[ADMIN MEMBER DETAIL V2] Unable to load ${metric}:`,
        result.error
      )
    }
  }

  const developmentRow = development.data as {
    development_score: NullableNumeric
  } | null
  const attendanceRow = attendance.data as {
    attendance_percentage: NullableNumeric
  } | null
  const quizRow = quiz.data as { quiz_score: NullableNumeric } | null
  const evaluationRow = evaluations.data as {
    evaluation_score: NullableNumeric
  } | null
  const reportRow = reports.data as {
    report_percentage: NullableNumeric
  } | null

  return {
    development: developmentRow
      ? { development_score: toNullableNumber(developmentRow.development_score) }
      : null,
    attendance: attendanceRow
      ? { attendance_percentage: toNullableNumber(attendanceRow.attendance_percentage) }
      : null,
    quiz: quizRow
      ? { quiz_score: toNullableNumber(quizRow.quiz_score) }
      : null,
    evaluations: evaluationRow
      ? { evaluation_score: toNullableNumber(evaluationRow.evaluation_score) }
      : null,
    reports: reportRow
      ? { report_percentage: toNullableNumber(reportRow.report_percentage) }
      : null,
    activity: activity.data,
  }
}
