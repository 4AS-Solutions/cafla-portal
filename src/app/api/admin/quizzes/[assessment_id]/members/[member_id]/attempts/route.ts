import { NextResponse } from "next/server"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getAdminQuizAttemptHistory } from "@/src/lib/queries/get-admin-quiz-history"

type RouteContext = {
  params: Promise<{
    assessment_id: string
    member_id: string
  }>
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    await requireBoard()

    const {
      assessment_id,
      member_id,
    } = await context.params

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

    if (!member_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Member ID is required.",
        },
        {
          status: 400,
        }
      )
    }

    const history =
      await getAdminQuizAttemptHistory(
        assessment_id,
        member_id
      )

    if (!history) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assessment or member not found.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json({
      success: true,
      history,
    })
  } catch (error) {
    console.error(
      "[QUIZ ADMIN HISTORY API] Failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to load attempt history."

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