import { NextResponse } from "next/server"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type RouteContext = {
  params: Promise<{
    assessment_id: string
  }>
}

type UpdateRulesBody = {
  required?: unknown
  counts_for_score?: unknown
  max_attempts?: unknown
  time_limit_minutes?: unknown
  questions_per_attempt?: unknown
  randomize_questions?: unknown
  randomize_options?: unknown
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    await requireBoard()

    const { assessment_id } =
      await context.params

    if (!assessment_id) {
      return validationError(
        "Assessment ID is required."
      )
    }

    const body =
      (await request.json()) as UpdateRulesBody

    // =========================================
    // BOOLEAN VALIDATION
    // =========================================

    if (
      typeof body.required !== "boolean" ||
      typeof body.counts_for_score !== "boolean" ||
      typeof body.randomize_questions !== "boolean" ||
      typeof body.randomize_options !== "boolean"
    ) {
      return validationError(
        "Invalid assessment rule values."
      )
    }

    // =========================================
    // NUMBER VALIDATION
    // =========================================

    const maxAttempts =
      Number(body.max_attempts)

    const timeLimitMinutes =
      Number(body.time_limit_minutes)

    const questionsPerAttempt =
      Number(body.questions_per_attempt)

    if (
      !Number.isInteger(maxAttempts) ||
      maxAttempts < 1 ||
      maxAttempts > 10
    ) {
      return validationError(
        "Maximum attempts must be between 1 and 10."
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

    /*
     * Optional assessments cannot
     * contribute to Development score.
     */
    const countsForScore =
      body.required
        ? body.counts_for_score
        : false

    const supabase =
      getSupabaseAdmin()

    // =========================================
    // LOAD ASSESSMENT
    // =========================================

    const {
      data: assessment,
      error: assessmentError,
    } = await supabase
      .schema("development")
      .from("quiz_assessments")
      .select(`
        id,
        status,
        content_locked_at
      `)
      .eq("id", assessment_id)
      .maybeSingle()

    if (assessmentError) {
      console.error(
        "[QUIZ RULES] Assessment lookup error:",
        assessmentError
      )

      throw new Error(
        "Unable to load the assessment."
      )
    }

    if (!assessment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assessment not found.",
        },
        {
          status: 404,
        }
      )
    }

    // =========================================
    // LIFECYCLE RULES
    // =========================================

    if (
      assessment.status === "archived"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Archived assessments cannot be modified.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * V1:
     * Once an attempt exists and content
     * has been locked, rules remain read-only.
     */
    if (
      assessment.content_locked_at
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assessment rules cannot be modified after a member has started an attempt.",
        },
        {
          status: 409,
        }
      )
    }

    // =========================================
    // UPDATE
    // =========================================

    const {
      data: updatedAssessment,
      error: updateError,
    } = await supabase
      .schema("development")
      .from("quiz_assessments")
      .update({
        required:
          body.required,

        counts_for_score:
          countsForScore,

        max_attempts:
          maxAttempts,

        time_limit_minutes:
          timeLimitMinutes,

        questions_per_attempt:
          questionsPerAttempt,

        randomize_questions:
          body.randomize_questions,

        randomize_options:
          body.randomize_options,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", assessment_id)
      .select(`
        id,
        status,
        required,
        counts_for_score,
        max_attempts,
        time_limit_minutes,
        questions_per_attempt,
        randomize_questions,
        randomize_options,
        content_locked_at,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error(
        "[QUIZ RULES] Update error:",
        updateError
      )

      throw new Error(
        "Unable to update assessment rules."
      )
    }

    return NextResponse.json({
      success: true,
      assessment:
        updatedAssessment,
    })
  } catch (error) {
    console.error(
      "[QUIZ RULES] API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to update assessment rules."

    if (message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Authentication is required.",
        },
        {
          status: 401,
        }
      )
    }

    if (message === "Forbidden") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Board access is required.",
        },
        {
          status: 403,
        }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    )
  }
}

function validationError(
  message: string
) {
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