import { NextResponse } from "next/server"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type RouteContext = {
  params: Promise<{
    assessment_id: string
  }>
}

export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const boardMember = await requireBoard()

    const { assessment_id } =
      await context.params

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

    const supabaseAdmin =
      getSupabaseAdmin()

    const {
      data: assessment,
      error,
    } = await supabaseAdmin
      .schema("development")
      .rpc(
        "publish_quiz_assessment",
        {
          p_assessment_id:
            assessment_id,

          p_published_by:
            boardMember.id,
        }
      )

    if (error) {
      console.error(
        "[QUIZ ADMIN] Publish assessment error:",
        error
      )

      return NextResponse.json(
        {
          success: false,
          error: getPublishErrorMessage(
            error.message
          ),
        },
        {
          status: 409,
        }
      )
    }

    return NextResponse.json({
      success: true,
      assessment,
    })
  } catch (error) {
    console.error(
      "[QUIZ ADMIN] Publish API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to publish the assessment."

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

function getPublishErrorMessage(
  message: string
) {
  const normalized =
    message.toLowerCase()

  if (
    normalized.includes(
      "only draft assessments"
    )
  ) {
    return "Only draft assessments can be published."
  }

  if (
    normalized.includes(
      "missing a language version"
    )
  ) {
    return "Every question must be completed in all enabled languages."
  }

  if (
    normalized.includes(
      "questions per attempt"
    )
  ) {
    return "The question bank does not contain enough valid questions."
  }

  if (
    normalized.includes(
      "invalid answer options"
    )
  ) {
    return "One or more questions contain invalid answer options."
  }

  if (
    normalized.includes(
      "availability window"
    )
  ) {
    return "A valid opening and closing window is required."
  }

  return message
}