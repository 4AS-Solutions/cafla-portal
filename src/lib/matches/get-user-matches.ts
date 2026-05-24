import { supabaseServer } from "@/src/lib/supabase/server"

type GetUserMatchesParams = {
  userId: string

  page?: number
  limit?: number

  search?: string

  matchStatus?: string

  reportStatus?: string

  date?: string
}

export async function getUserMatches({
  userId,

  page = 0,
  limit = 10,

  search,
  matchStatus,
  reportStatus,
  date,
}: GetUserMatchesParams) {

  const supabase = await supabaseServer()

  const from = page * limit

  const to = from + limit - 1

  let query = supabase
    .from("matches")
    .select(`
      id,
      home_team,
      away_team,
      league,
      division,
      location,
      field,
      kickoff_at,

      center_referee_id,
      assistant_referee_1_id,
      assistant_referee_2_id,

      center_referee:center_referee_id (
        id,
        full_name
      ),

      ar1:assistant_referee_1_id (
        id,
        full_name
      ),

      ar2:assistant_referee_2_id (
        id,
        full_name
      ),

      match_reports (
        status,
        submitted_at
      )
    `, {
      count: "exact",
    })
    .or(`center_referee_id.eq.${userId},assistant_referee_1_id.eq.${userId},assistant_referee_2_id.eq.${userId}`)

  // =====================================================
  // 🔥 SEARCH
  // =====================================================

  if (search) {
    query = query.or( `home_team.ilike.%${search}%,away_team.ilike.%${search}%,league.ilike.%${search}%` )
  }

  // =====================================================
  // 🔥 DATE FILTER
  // =====================================================

  if (date) {

    const now = new Date()

    let fromDate: Date | null = null

    if (date === "7d") {
      fromDate = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000
      )
    }

    if (date === "30d") {
      fromDate = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000
      )
    }

    if (date === "1y") {
      fromDate = new Date(
        now.getTime() - 365 * 24 * 60 * 60 * 1000
      )
    }

    if (fromDate) {
      query = query.gte(
        "kickoff_at",
        fromDate.toISOString()
      )
    }
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
      "getUserMatches error:",
      error
    )

    throw error
  }

  const now = new Date()

  const matches = (data ?? [])
    .map((m: any) => {

      let role = "AR"

      if (m.center_referee_id === userId) {
        role = "CR"
      }

      if (m.assistant_referee_1_id === userId) {
        role = "AR1"
      }

      if (m.assistant_referee_2_id === userId) {
        role = "AR2"
      }

      const report = Array.isArray(
        m.match_reports
      )
        ? m.match_reports[0]
        : m.match_reports

      const report_status =
        report?.status ?? "pending"

      return {
        ...m,
        role,
        report_status,
      }
    })

    // =====================================================
    // 🔥 MATCH STATUS FILTER
    // =====================================================

    .filter((match) => {

      if (!matchStatus) {
        return true
      }

      const kickoff = new Date(
        match.kickoff_at
      )

      if (
        matchStatus === "upcoming"
      ) {
        return kickoff > now
      }

      if (
        matchStatus === "played"
      ) {
        return kickoff <= now
      }

      return true
    })

    // =====================================================
    // 🔥 REPORT STATUS FILTER
    // =====================================================

    .filter((match) => {

      if (!reportStatus) {
        return true
      }

      return (
        match.report_status ===
        reportStatus
      )
    })

  return {
    data: matches,
    count: count ?? 0,
  }
}