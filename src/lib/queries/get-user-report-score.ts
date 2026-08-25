import "server-only"

import { getUser } from "@/src/lib/auth/get-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type UserReportScore = {
  cycle_id: string
  member_id: string
  full_name: string
  reports_required: number
  reports_submitted: number
  reports_on_time: number
  reports_late: number
  reports_missing: number
  report_points: number
  report_percentage: number
}

type ReportScoreRow = {
  cycle_id: string
  member_id: string
  full_name: string
  reports_required: number | string | null
  reports_submitted: number | string | null
  reports_on_time: number | string | null
  reports_late: number | string | null
  reports_missing: number | string | null
  report_points: number | string | null
  report_percentage: number | string | null
}

export async function getUserReportScore(): Promise<UserReportScore | null> {
  const user = await getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const supabaseAdmin = getSupabaseAdmin()

  const {
    data: activeCycle,
    error: activeCycleError,
  } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select("id")
    .eq("status", "active")
    .maybeSingle()

  if (activeCycleError) {
    console.error(
      "[REPORTS V2] Unable to load the active development cycle:",
      activeCycleError
    )

    throw new Error(
      "Unable to load the active development cycle."
    )
  }

  if (!activeCycle) {
    return null
  }

  const { data, error } = await supabaseAdmin
    .schema("development")
    .from("referee_report_score")
    .select(`
      cycle_id,
      member_id,
      full_name,
      reports_required,
      reports_submitted,
      reports_on_time,
      reports_late,
      reports_missing,
      report_points,
      report_percentage
    `)
    .eq("cycle_id", activeCycle.id)
    .eq("member_id", user.id)
    .maybeSingle()

  if (error) {
    console.error(
      "[REPORTS V2] Unable to load the referee report score:",
      error
    )

    throw new Error(
      "Unable to load the referee report score."
    )
  }

  if (!data) {
    return null
  }

  const row = data as ReportScoreRow

  return {
    cycle_id: row.cycle_id,
    member_id: row.member_id,
    full_name: row.full_name,
    reports_required: Number(row.reports_required ?? 0),
    reports_submitted: Number(row.reports_submitted ?? 0),
    reports_on_time: Number(row.reports_on_time ?? 0),
    reports_late: Number(row.reports_late ?? 0),
    reports_missing: Number(row.reports_missing ?? 0),
    report_points: Number(row.report_points ?? 0),
    report_percentage: Number(row.report_percentage ?? 0),
  }
}
