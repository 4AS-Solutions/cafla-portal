import { NextResponse } from "next/server"

import { getUserEvaluationObligations } from "@/src/lib/queries/get-user-evaluation-obligations"
import { supabaseServer } from "@/src/lib/supabase/server"

type EvaluationPayload = {
  matchId: string
  evaluatedId: string
  arrival: number
  fitness: number
  communication: number
  teamwork: number
  professionalism: number
  comments: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isValidScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  )
}

function parsePayload(body: unknown): EvaluationPayload | null {
  if (!isRecord(body)) return null

  const matchId = typeof body.matchId === "string" ? body.matchId.trim() : ""
  const evaluatedId = typeof body.evaluatedId === "string" ? body.evaluatedId.trim() : ""
  const commentsValue = body.comments

  if (
    !matchId ||
    !evaluatedId ||
    !isValidScore(body.arrival) ||
    !isValidScore(body.fitness) ||
    !isValidScore(body.communication) ||
    !isValidScore(body.teamwork) ||
    !isValidScore(body.professionalism) ||
    (commentsValue !== undefined && typeof commentsValue !== "string")
  ) {
    return null
  }

  const normalizedComments = commentsValue?.trim() ?? ""

  return {
    matchId,
    evaluatedId,
    arrival: body.arrival,
    fitness: body.fitness,
    communication: body.communication,
    teamwork: body.teamwork,
    professionalism: body.professionalism,
    comments: normalizedComments || null,
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let body: unknown

    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      )
    }

    const payload = parsePayload(body)

    if (!payload) {
      return NextResponse.json(
        {
          error:
            "Invalid evaluation payload. All five scores must be integers from 1 to 5.",
        },
        { status: 400 }
      )
    }

    const obligations = await getUserEvaluationObligations()
    const obligation = obligations.find(
      (item) =>
        item.match_id === payload.matchId &&
        item.evaluated_id === payload.evaluatedId &&
        item.evaluator_id === user.id
    )

    if (!obligation) {
      return NextResponse.json(
        { error: "Evaluation obligation not found or not authorized." },
        { status: 403 }
      )
    }

    const obligationIsConsistent =
      obligation.evaluator_id === user.id &&
      obligation.evaluator_id !== obligation.evaluated_id &&
      obligation.match_id === payload.matchId &&
      obligation.evaluated_id === payload.evaluatedId

    if (!obligationIsConsistent) {
      console.error(
        "[EVALUATIONS V2] Inconsistent evaluation obligation detected."
      )

      return NextResponse.json(
        { error: "Evaluation obligation is not authorized." },
        { status: 403 }
      )
    }

    if (obligation.obligation_status === "missed") {
      return NextResponse.json(
        { error: "The evaluation window has expired." },
        { status: 410 }
      )
    }

    if (obligation.obligation_status !== "pending") {
      return NextResponse.json(
        { error: "This evaluation has already been submitted." },
        { status: 409 }
      )
    }

    const { error: insertError } = await supabase
      .from("evaluations")
      .insert({
        match_id: payload.matchId,
        evaluator_id: user.id,
        evaluated_id: payload.evaluatedId,
        role_of_evaluator: obligation.evaluator_role,
        role_of_evaluated: obligation.evaluated_role,
        arrival_score: payload.arrival,
        fitness_score: payload.fitness,
        communication_score: payload.communication,
        teamwork_score: payload.teamwork,
        professionalism_score: payload.professionalism,
        comments: payload.comments,
      })

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "This evaluation has already been submitted." },
          { status: 409 }
        )
      }

      console.error(
        "[EVALUATIONS V2] Unable to submit evaluation:",
        insertError
      )

      return NextResponse.json(
        { error: "Unable to submit the evaluation." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 201 }
    )
  } catch (error) {
    console.error(
      "[EVALUATIONS V2] Unexpected evaluation submission failure:",
      error
    )

    return NextResponse.json(
      { error: "Unable to submit the evaluation." },
      { status: 500 }
    )
  }
}
