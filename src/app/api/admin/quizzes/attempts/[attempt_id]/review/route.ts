import { NextResponse } from "next/server"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getAdminQuizAttemptReview } from "@/src/lib/queries/get-admin-quiz-attempt-review"

type RouteContext = {
  params: Promise<{
    attempt_id: string
  }>
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    await requireBoard()

    const { attempt_id } =
      await context.params

    if (!attempt_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Attempt ID is required.",
        },
        {
          status: 400,
        }
      )
    }

    const review =
      await getAdminQuizAttemptReview(
        attempt_id
      )

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: "Quiz attempt not found.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json({
      success: true,
      review,
    })
  } catch (error) {
    console.error(
      "[QUIZ ADMIN REVIEW API] Failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the quiz attempt review."

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status:
          message === "Unauthorized"
            ? 401
            : message.includes(
                  "Only completed or expired"
                )
              ? 409
              : 500,
      }
    )
  }
}