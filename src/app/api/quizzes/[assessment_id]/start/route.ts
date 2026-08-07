import { NextResponse } from "next/server"

import { requireUser } from "@/src/lib/auth/require-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

const allowedLanguages = ["es", "en"] as const

type QuizLanguage =
  (typeof allowedLanguages)[number]

type RouteContext = {
  params: Promise<{
    assessment_id: string
  }>
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await requireUser()

    const { assessment_id } =
      await context.params

    const body = await request.json()

    const language = String(
      body?.language ?? ""
    ).toLowerCase() as QuizLanguage

    if (!assessment_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assessment ID is required.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !allowedLanguages.includes(language)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid quiz language is required.",
        },
        {
          status: 400,
        }
      )
    }

    const supabaseAdmin =
      getSupabaseAdmin()

    const {
      data: attempt,
      error,
    } = await supabaseAdmin
      .schema("development")
      .rpc("start_quiz_attempt", {
        p_assessment_id:
          assessment_id,
        p_member_id: user.id,
        p_language: language,
      })

    if (error) {
      console.error(
        "[QUIZZES] Unable to start attempt:",
        error
      )

      return NextResponse.json(
        {
          success: false,
          error: getStartErrorMessage(
            error.message
          ),
        },
        {
          status: resolveStartStatus(
            error.message
          ),
        }
      )
    }

    return NextResponse.json({
      success: true,
      attempt,
    })
  } catch (error) {
    console.error(
      "[QUIZZES] Start attempt API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to start the quiz."

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

function resolveStartStatus(
  message: string
) {
  const normalized =
    message.toLowerCase()

  if (
    normalized.includes("not found")
  ) {
    return 404
  }

  if (
    normalized.includes("not enrolled") ||
    normalized.includes("not eligible")
  ) {
    return 403
  }

  if (
    normalized.includes("not open") ||
    normalized.includes("not available for attempts") ||
    normalized.includes("closed") ||
    normalized.includes("no quiz attempts") ||
    normalized.includes("expired")
  ) {
    return 409
  }

  return 500
}

function getStartErrorMessage(
  message: string
) {
  const normalized =
    message.toLowerCase()

  if (
    normalized.includes(
      "no quiz attempts remain"
    )
  ) {
    return "You have used all available attempts for this quiz."
  }

  if (
    normalized.includes(
      "not open yet"
    )
  ) {
    return "This quiz is not open yet."
  }

  if (
    normalized.includes(
      "availability window has closed"
    )
  ) {
    return "The availability window for this quiz has closed."
  }

  if (
    normalized.includes(
      "active attempt has expired"
    )
  ) {
    return "Your previous attempt expired and must be finalized before another attempt can begin."
  }

  if (
    normalized.includes(
      "selected language version"
    )
  ) {
    return "The selected language is not available."
  }

  if (
    normalized.includes(
      "not available for attempts"
    )
  ) {
    return "This quiz is no longer available for new attempts."
  }

  return message
}