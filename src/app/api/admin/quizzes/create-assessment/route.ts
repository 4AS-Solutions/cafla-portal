import { NextResponse } from "next/server"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

const allowedCategories = [
  "laws_of_the_game",
  "competition_rules",
  "class_review",
  "other",
] as const

type QuizCategory =
  (typeof allowedCategories)[number]

type CreateAssessmentBody = {
  title?: unknown
  description?: unknown
  category?: unknown

  required?: unknown
  counts_for_score?: unknown

  max_attempts?: unknown
  time_limit_minutes?: unknown
  questions_per_attempt?: unknown

  randomize_questions?: unknown
  randomize_options?: unknown

  open_from?: unknown
  open_until?: unknown
}

export async function POST(request: Request) {
  try {
    const boardMember = await requireBoard()
    const body =
      (await request.json()) as CreateAssessmentBody

    const title = String(
      body.title ?? ""
    ).trim()

    const description = String(
      body.description ?? ""
    ).trim()

    const category = String(
      body.category ?? ""
    ) as QuizCategory

    const required =
      body.required === true

    const countsForScore =
      body.counts_for_score === true

    const maxAttempts = Number(
      body.max_attempts
    )

    const timeLimitMinutes = Number(
      body.time_limit_minutes
    )

    const questionsPerAttempt = Number(
      body.questions_per_attempt
    )

    const randomizeQuestions =
      body.randomize_questions !== false

    const randomizeOptions =
      body.randomize_options !== false

    const openFrom = String(
      body.open_from ?? ""
    ).trim()

    const openUntil = String(
      body.open_until ?? ""
    ).trim()

    if (!title) {
      return validationError(
        "Assessment title is required."
      )
    }

    if (
      !allowedCategories.includes(category)
    ) {
      return validationError(
        "Select a valid assessment category."
      )
    }

    if (
      !Number.isInteger(maxAttempts) ||
      maxAttempts < 1 ||
      maxAttempts > 10
    ) {
      return validationError(
        "Attempts must be between 1 and 10."
      )
    }

    if (
      !Number.isInteger(timeLimitMinutes) ||
      timeLimitMinutes < 1 ||
      timeLimitMinutes > 240
    ) {
      return validationError(
        "Time limit must be between 1 and 240 minutes."
      )
    }

    if (
      !Number.isInteger(questionsPerAttempt) ||
      questionsPerAttempt < 1 ||
      questionsPerAttempt > 200
    ) {
      return validationError(
        "Questions per attempt must be between 1 and 200."
      )
    }

    if (countsForScore && !required) {
      return validationError(
        "An assessment that counts for Development must be required."
      )
    }

    const openFromDate = new Date(openFrom)
    const openUntilDate = new Date(openUntil)

    if (
      !openFrom ||
      Number.isNaN(openFromDate.getTime())
    ) {
      return validationError(
        "A valid opening date is required."
      )
    }

    if (
      !openUntil ||
      Number.isNaN(openUntilDate.getTime())
    ) {
      return validationError(
        "A valid closing date is required."
      )
    }

    if (
      openFromDate.getTime() >=
      openUntilDate.getTime()
    ) {
      return validationError(
        "The closing date must be after the opening date."
      )
    }

    const supabaseAdmin =
      getSupabaseAdmin()

    const {
      data: activeCycle,
      error: cycleError,
    } = await supabaseAdmin
      .schema("development")
      .from("cycles")
      .select("id, name")
      .eq("status", "active")
      .maybeSingle()

    if (cycleError) {
      console.error(
        "[QUIZ ADMIN] Active cycle error:",
        cycleError
      )

      throw new Error(
        "Unable to load the active development cycle."
      )
    }

    if (!activeCycle) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An active development cycle is required.",
        },
        {
          status: 409,
        }
      )
    }

    const {
      data: assessment,
      error: createError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_assessments")
      .insert({
        cycle_id: activeCycle.id,

        title,
        description:
          description || null,
        category,

        status: "draft",

        required,
        counts_for_score:
          countsForScore,

        max_attempts: maxAttempts,
        time_limit_minutes:
          timeLimitMinutes,
        questions_per_attempt:
          questionsPerAttempt,

        randomize_questions:
          randomizeQuestions,
        randomize_options:
          randomizeOptions,

        open_from: openFromDate.toISOString(),
        open_until:
          openUntilDate.toISOString(),

        created_by: boardMember.id,
      })
      .select(`
        id,
        title,
        status,
        cycle_id,
        created_at
      `)
      .single()

    if (createError) {
      console.error(
        "[QUIZ ADMIN] Create assessment error:",
        createError
      )

      throw new Error(
        "Unable to create the assessment."
      )
    }

    return NextResponse.json({
      success: true,
      assessment,
    })
  } catch (error) {
    console.error(
      "[QUIZ ADMIN] Create assessment API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create the assessment."

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status:
          message === "Unauthorized"
            ? 401
            : 500,
      }
    )
  }
}

function validationError(message: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status: 400,
    }
  )
}