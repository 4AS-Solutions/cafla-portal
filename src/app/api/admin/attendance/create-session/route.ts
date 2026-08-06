import { NextResponse } from "next/server"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { createAttendanceSession } from "@/src/lib/queries/create-attendance-session"
import { localLosAngelesDateTimeToUTC } from "@/src/lib/utils/session-utils"

const allowedSessionTypes = [
  "class",
  "training",
  "meeting",
  "special",
  "other",
] as const

type AttendanceSessionType =
  (typeof allowedSessionTypes)[number]

export async function POST(
  request: Request
) {
  try {
    const profile =
      await requireBoardApi()

    const formData =
      await request.formData()

    const title = String(
      formData.get("title") ?? ""
    ).trim()

    const sessionType = String(
      formData.get(
        "session_type"
      ) ?? ""
    ).toLowerCase()

    const rawDate = String(
      formData.get(
        "session_date"
      ) ?? ""
    ).trim()

    const location = String(
      formData.get("location") ?? ""
    ).trim()

    const countsForScore =
      formData.get(
        "counts_for_score"
      ) !== null

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Session title is required.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !allowedSessionTypes.includes(
        sessionType as AttendanceSessionType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid attendance session type.",
        },
        {
          status: 400,
        }
      )
    }

    if (!rawDate) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Session date is required.",
        },
        {
          status: 400,
        }
      )
    }

    let scheduledAt: string

    try {
      scheduledAt =
        localLosAngelesDateTimeToUTC(
          rawDate
        )
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid session date and time.",
        },
        {
          status: 400,
        }
      )
    }

    const session =
      await createAttendanceSession({
        title,
        sessionType:
          sessionType as AttendanceSessionType,
        scheduledAt,
        location,
        countsForScore,
        createdBy: profile.id,
      })

    return NextResponse.json(
      {
        success: true,
        session,
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error(
      "[ATTENDANCE] Create session API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create attendance session."

    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : message.includes(
                "future"
              ) ||
              message.includes(
                "scheduled within"
              ) ||
              message.includes(
                "active development cycle"
              )
            ? 400
            : 500

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status,
      }
    )
  }
}