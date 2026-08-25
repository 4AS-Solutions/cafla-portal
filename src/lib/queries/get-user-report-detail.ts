import "server-only"

import { getUser } from "@/src/lib/auth/get-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type UserReportDetail = {
  match_id: string
  home_team: string
  away_team: string
  league: string | null
  division: string | null
  location: string | null
  field: string | null
  kickoff_at: string
  match_date_la: string
  report_id: string | null
  report_status: string | null
  submitted_at: string | null
  submitted_at_la: string | null
  submitted_date_la: string | null
  report_submitted: boolean
  submitted_on_time: boolean | null
  report_points: number
}

type ReportDetailRow = Omit<UserReportDetail, "report_points"> & {
  report_points: number | string | null
}

export async function getUserReportDetail(): Promise<UserReportDetail[]> {
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
    return []
  }

  const { data, error } = await supabaseAdmin
    .schema("development")
    .from("referee_report_detail")
    .select(`
      match_id,
      home_team,
      away_team,
      league,
      division,
      location,
      field,
      kickoff_at,
      match_date_la,
      report_id,
      report_status,
      submitted_at,
      submitted_at_la,
      submitted_date_la,
      report_submitted,
      submitted_on_time,
      report_points
    `)
    .eq("cycle_id", activeCycle.id)
    .eq("member_id", user.id)
    .order("kickoff_at", {
      ascending: false,
    })

  if (error) {
    console.error(
      "[REPORTS V2] Unable to load the referee report detail:",
      error
    )

    throw new Error(
      "Unable to load the referee report detail."
    )
  }

  const rows = (data ?? []) as ReportDetailRow[]

  return rows.map((row) => ({
    ...row,
    report_points: Number(row.report_points ?? 0),
  }))
}
