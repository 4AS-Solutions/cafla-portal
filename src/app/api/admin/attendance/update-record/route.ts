import { NextResponse } from "next/server"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

const allowedStatuses = [
  "present",
  "late",
  "excused",
] as const

type AttendanceStatus =
  (typeof allowedStatuses)[number]

export async function POST(request: Request) {
  try {
    const boardMember = await requireBoardApi()

    const body = await request.json()

    const sessionId = String(
      body?.session_id ?? ""
    ).trim()

    const memberId = String(
      body?.member_id ?? ""
    ).trim()

    const status = String(
      body?.status ?? ""
    ).toLowerCase() as AttendanceStatus

    if (!sessionId || !memberId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Session ID and member ID are required.",
        },
        {
          status: 400,
        }
      )
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid attendance status.",
        },
        {
          status: 400,
        }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const {
      data: session,
      error: sessionError,
    } = await supabaseAdmin
      .schema("development")
      .from("attendance_sessions")
      .select(`
        id,
        cycle_id,
        scheduled_at,
        status
      `)
      .eq("id", sessionId)
      .maybeSingle()

    if (sessionError) {
      console.error(
        "[ATTENDANCE] Session lookup failed:",
        sessionError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load attendance session.",
        },
        {
          status: 500,
        }
      )
    }

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Attendance session not found.",
        },
        {
          status: 404,
        }
      )
    }

    if (
      session.status !== "open" &&
      session.status !== "completed"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Attendance can only be updated for open or completed sessions.",
        },
        {
          status: 409,
        }
      )
    }

    const localSessionDate =
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(
        new Date(session.scheduled_at)
      )

    const {
      data: cycleMember,
      error: cycleMemberError,
    } = await supabaseAdmin
      .schema("development")
      .from("cycle_members")
      .select(`
        member_id,
        effective_from,
        effective_until,
        enrollment_type,
        status
      `)
      .eq("cycle_id", session.cycle_id)
      .eq("member_id", memberId)
      .maybeSingle()

    if (cycleMemberError) {
      console.error(
        "[ATTENDANCE] Cycle member lookup failed:",
        cycleMemberError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to validate the cycle participant.",
        },
        {
          status: 500,
        }
      )
    }

   const isEligible =
      Boolean(
        cycleMember &&
        (
          cycleMember.enrollment_type ===
            "existing_member"
            ? (
                !cycleMember.effective_until ||
                cycleMember.effective_until >=
                  localSessionDate
              )
            : (
                cycleMember.effective_from <=
                  localSessionDate &&
                (
                  !cycleMember.effective_until ||
                  cycleMember.effective_until >=
                    localSessionDate
                )
              )
        )
      )

    if (!isEligible) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This member is not eligible for the selected session.",
        },
        {
          status: 409,
        }
      )
    }

    const {
      data: record,
      error: recordError,
    } = await supabaseAdmin
      .schema("development")
      .from("attendance_records")
      .upsert(
        {
          session_id: sessionId,
          member_id: memberId,
          status,
          recorded_by: boardMember.id,
          recorded_at:
            new Date().toISOString(),
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "session_id,member_id",
        }
      )
      .select(`
        session_id,
        member_id,
        status
      `)
      .single()

    if (recordError) {
      console.error(
        "[ATTENDANCE] Update record failed:",
        recordError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to update attendance.",
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      success: true,
      record,
    })
  } catch (error) {
    console.error(
      "[ATTENDANCE] Update record API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to update attendance."

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status:
          message === "Unauthorized"
            ? 401
            : message === "Forbidden"
              ? 403
              : 500,
      }
    )
  }
}