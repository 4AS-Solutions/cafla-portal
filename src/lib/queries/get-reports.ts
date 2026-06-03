import { supabaseServer } from "@/src/lib/supabase/server"

export type ReportRow = {
  match_id: string
  status: string
  submitted_at: string | null
  home_score: number | null
  away_score: number | null
  matches: {
    home_team: string
    away_team: string
    kickoff_at: string
  }
}

export async function getReports(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {

  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      data: [],
      count: 0,
    }
  }

  const page = params?.page ?? 0

  const limit = params?.limit ?? 10

  const from = page * limit

  const to = from + limit - 1
  const search = params?.search?.trim()
  const status = params?.status

  let query = supabase
    .from("matches")
    .select(`
      id,
      home_team,
      away_team,
      kickoff_at,
      match_reports (
        status,
        home_score,
        away_score,
        submitted_at
      )
    `, {
      count: "exact",
    })
    .eq("center_referee_id", user.id)
    .lt("kickoff_at", new Date().toISOString())

  // 🔥 SEARCH
  if (search) {

    query = query.or(` home_team.ilike.%${search}%, away_team.ilike.%${search}%`)

  }

  // 🔥 STATUS
  if (
    status &&
    status !== "all"
  ) {

    query = query.eq(
      "match_reports.status",
      status
    )

  }

  const {
    data,
    error,
    count,
  } = await query
    .order("kickoff_at", {
      ascending: false,
    })
    .range(from, to)

  if (error) {

    console.error(
      "getReports error:",
      error
    )

    throw error
  }

  const mappedReports = (data ?? []).map((match: any) => {

    const report = Array.isArray(
      match.match_reports
    )
      ? match.match_reports[0]
      : match.match_reports

    return {

      match_id: match.id,

      status:
        report?.status ?? "pending",

      submitted_at:
        report?.submitted_at ?? null,

      home_score:
        report?.home_score ?? null,

      away_score:
        report?.away_score ?? null,

      matches: {
        home_team: match.home_team,
        away_team: match.away_team,
        kickoff_at: match.kickoff_at,
      },
    }
  })

  return {
    data: mappedReports,
    count: count ?? 0,
  }
}