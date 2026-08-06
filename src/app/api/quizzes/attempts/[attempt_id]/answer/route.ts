import { NextResponse } from "next/server"

import { requireUser } from "@/src/lib/auth/require-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type RouteContext = {
  params: Promise<{
    attempt_id: string
  }>
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await requireUser()

    const { attempt_id } =
      await context.params

    const body = await request.json()

    const attemptQuestionId = String(
      body?.attempt_question_id ?? ""
    ).trim()

    const selectedOptionId = String(
      body?.selected_option_id ?? ""
    ).trim()

    if (
      !attempt_id ||
      !attemptQuestionId ||
      !selectedOptionId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Attempt question and selected option are required.",
        },
        {
          status: 400,
        }
      )
    }

    const supabaseAdmin =
      getSupabaseAdmin()

    const {
      data: answer,
      error,
    } = await supabaseAdmin
      .schema("development")
      .rpc("save_quiz_answer", {
        p_attempt_id: attempt_id,
        p_member_id: user.id,
        p_attempt_question_id:
          attemptQuestionId,
        p_selected_option_id:
          selectedOptionId,
      })

    if (error) {
      console.error(
        "[QUIZZES] Unable to save answer:",
        error
      )

      return NextResponse.json(
        {
          success: false,
          error:
            getAnswerErrorMessage(
              error.message
            ),
        },
        {
          status:
            error.message
              .toLowerCase()
              .includes("expired")
              ? 409
              : 400,
        }
      )
    }

    return NextResponse.json({
      success: true,
      answer,
    })
  } catch (error) {
    console.error(
      "[QUIZZES] Answer API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to save the answer."

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

function getAnswerErrorMessage(
  message: string
) {
  const normalized =
    message.toLowerCase()

  if (normalized.includes("expired")) {
    return "Your quiz time has expired."
  }

  if (
    normalized.includes(
      "does not belong"
    )
  ) {
    return "This quiz attempt is not available."
  }

  if (
    normalized.includes(
      "selected answer option is invalid"
    )
  ) {
    return "The selected answer is invalid."
  }

  return message
}