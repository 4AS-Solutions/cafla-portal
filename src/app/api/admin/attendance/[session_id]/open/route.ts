import { NextResponse } from "next/server"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export async function POST(
  _request: Request,
  context: {
    params: Promise<{
      session_id: string
    }>
  }
) {
  try {
    const boardMember = await requireBoardApi()

    const { session_id } =
      await context.params

    if (!session_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Attendance session ID is required.",
        },
        {
          status: 400,
        }
      )
    }

    const supabaseAdmin =
      getSupabaseAdmin()

    const {
      data: session,
      error: sessionError,
    } = await supabaseAdmin
      .schema("development")
      .from("attendance_sessions")
      .select(`
        id,
        cycle_id,
        title,
        status,
        scheduled_at
      `)
      .eq("id", session_id)
      .maybeSingle()

    if (sessionError) {
      console.error(
        "[ATTENDANCE] Open session lookup failed:",
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

    if (session.status !== "scheduled") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only scheduled sessions can be opened.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * Evitamos que exista más de una sesión abierta
     * simultáneamente dentro del mismo ciclo.
     */
    const {
      data: existingOpenSession,
      error: openSessionError,
    } = await supabaseAdmin
      .schema("development")
      .from("attendance_sessions")
      .select("id, title")
      .eq("cycle_id", session.cycle_id)
      .eq("status", "open")
      .neq("id", session.id)
      .limit(1)
      .maybeSingle()

    if (openSessionError) {
      console.error(
        "[ATTENDANCE] Open session verification failed:",
        openSessionError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify attendance workflow.",
        },
        {
          status: 500,
        }
      )
    }

    if (existingOpenSession) {
      return NextResponse.json(
        {
          success: false,
          error: `Complete the open session "${existingOpenSession.title}" before opening another one.`,
        },
        {
          status: 409,
        }
      )
    }

    const {
      data: updatedSession,
      error: updateError,
    } = await supabaseAdmin
      .schema("development")
      .from("attendance_sessions")
      .update({
          status: "open",
          opened_at: new Date().toISOString(),
          opened_by: boardMember.id,
          updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .eq("status", "scheduled")
      .select(`
        id,
        title,
        status,
        scheduled_at
      `)
      .single()

    if (updateError) {
      console.error(
        "[ATTENDANCE] Unable to open attendance:",
        updateError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to open attendance.",
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
    })
  } catch (error) {
    console.error(
      "[ATTENDANCE] Open session API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to open attendance."

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