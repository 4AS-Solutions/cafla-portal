import { getSupabaseAdmin } from "@/src/lib/supabase/admin"
import { createClient } from "@/src/lib/supabase/server"
import { NextResponse } from "next/server"


type GoalRow = {
  team: "home" | "away"
  player_name: string
  player_number: string
  minute: number
  half: "first" | "second"
  goal_type: "normal" | "penalty" | "own_goal"
}

type CardRow = {
  team: "home" | "away"
  player_name: string
  player_number: string
  minute: number
  card_type: "yellow" | "red"
  reason_code: string
  notes?: string
}

type SubmitPayload = {
  match_id: string
  home_score: number
  away_score: number
  comments: string
  goals: GoalRow[]
  cards: CardRow[]
  home_roster_path?: string | null
  away_roster_path?: string | null
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = await getSupabaseAdmin();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = (await req.json()) as SubmitPayload

    // 1) Cargar el match y validar central
    const { data: match, error: matchError } = await supabaseAdmin
      .from("matches")
      .select("id, center_referee_id, report_status")
      .eq("id", body.match_id)
      .maybeSingle()

    if (matchError) throw matchError
    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      )
    }

    if (match.center_referee_id !== user.id) {
      return NextResponse.json(
        { error: "Only the center referee can submit this report" },
        { status: 403 }
      )
    }

    // 2) Evitar duplicados
    const { data: existingReport, error: existingReportError } = await supabaseAdmin
      .from("match_reports")
      .select("id")
      .eq("match_id", body.match_id)
      .maybeSingle()

    if (existingReportError) throw existingReportError

    if (existingReport) {
      return NextResponse.json(
        { error: "A report already exists for this match" },
        { status: 409 }
      )
    }

    // 3) Crear report principal
    const { data: report, error: reportError } = await supabaseAdmin
      .from("match_reports")
      .insert({
        match_id: body.match_id,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        home_score: body.home_score,
        away_score: body.away_score,
        comments: body.comments,
        status: "submitted",
      })
      .select("id")
      .single()

    if (reportError) throw reportError

    const reportId = report.id

    // 4) Insertar goals
    if (body.goals?.length) {
      const goalsPayload = body.goals.map((goal) => ({
        report_id: reportId,
        team: goal.team,
        player_name: goal.player_name,
        player_number: goal.player_number,
        minute: Number(goal.minute),
        half: goal.half,
        goal_type: goal.goal_type,
      }))

      const { error: goalsError } = await supabaseAdmin
        .from("report_goals")
        .insert(goalsPayload)

      if (goalsError) throw goalsError
    }

    // 5) Insertar cards
    if (body.cards?.length) {
      const cardsPayload = body.cards.map((card) => ({
        report_id: reportId,
        team: card.team,
        player_name: card.player_name,
        player_number: card.player_number,
        minute: Number(card.minute),
        card_type: card.card_type,
        reason_code: card.reason_code,
        notes: card.notes || null,
      }))

      const { error: cardsError } = await supabaseAdmin
        .from("report_cards")
        .insert(cardsPayload)

      if (cardsError) throw cardsError
    }

    // 6) Insertar assets ya subidos
    const assetsPayload: Array<{
      report_id: string
      asset_type: string
      storage_path: string
    }> = []

    if (body.home_roster_path) {
      assetsPayload.push({
        report_id: reportId,
        asset_type: "roster_home",
        storage_path: body.home_roster_path,
      })
    }

    if (body.away_roster_path) {
      assetsPayload.push({
        report_id: reportId,
        asset_type: "roster_away",
        storage_path: body.away_roster_path,
      })
    }

    if (assetsPayload.length) {
      const { error: assetsError } = await supabaseAdmin
        .from("report_assets")
        .insert(assetsPayload)

      if (assetsError) throw assetsError
    }

    // 7) Actualizar estado del match
    const { error: updateMatchError } = await supabaseAdmin
      .from("matches")
      .update({ report_status: "submitted" })
      .eq("id", body.match_id)

    if (updateMatchError) throw updateMatchError

    return NextResponse.json({
      success: true,
      report_id: reportId,
    })
  } catch (error) {
    console.error("Submit report error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error submitting report",
      },
      { status: 500 }
    )
  }
}