import { NextResponse } from "next/server"

import { requireUser } from "@/src/lib/auth/require-user"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type RouteContext = {
  params: Promise<{
    attempt_id: string
  }>
}

export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await requireUser()

    const { attempt_id } =
      await context.params

    if (!attempt_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Quiz attempt ID is required.",
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
      .rpc("finalize_quiz_attempt", {
        p_attempt_id: attempt_id,
        p_member_id: user.id,
        p_finalize_as: "submitted",
      })

    if (error) {
      console.error(
        "[QUIZZES] Unable to submit attempt:",
        error
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to submit the quiz.",
        },
        {
          status: 400,
        }
      )
    }

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        status: attempt.status,
        score: Number(
          attempt.score ?? 0
        ),
        correctCount:
          attempt.correct_count ?? 0,
        totalQuestions:
          attempt.total_questions ?? 0,
      },
    })
  } catch (error) {
    console.error(
      "[QUIZZES] Submit API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit the quiz."

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