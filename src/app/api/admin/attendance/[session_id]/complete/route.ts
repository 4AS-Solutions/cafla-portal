import { NextResponse } from "next/server"

import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"
import { getSessionAttendance } from "@/src/lib/queries/get-session-attendance"

type RouteContext = {
  params: Promise<{
    session_id: string
  }>
}

/*
 * GET:
 * Devuelve una vista previa actualizada directamente
 * desde la base de datos antes de completar.
 */
export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    await requireBoardApi()

    const { session_id } =
      await context.params

    const result =
      await getSessionAttendance(
        session_id
      )

    if (
      result.session.status !== "open"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only open sessions can be completed.",
        },
        {
          status: 409,
        }
      )
    }

    return NextResponse.json({
      success: true,
      session: result.session,
      summary: result.summary,
    })
  } catch (error) {
    console.error(
      "[ATTENDANCE] Completion preview failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to review attendance."

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
              : message.includes(
                    "not found"
                  )
                ? 404
                : 500,
      }
    )
  }
}

/*
 * POST:
 * Cambia open → completed.
 *
 * No inserta registros absent. Los ausentes continúan
 * calculándose de forma implícita mediante las vistas.
 */
export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const boardMember =
      await requireBoardApi()

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

    /*
     * Verificación previa para devolver un error claro.
     */
    const {
      data: session,
      error: sessionError,
    } = await supabaseAdmin
      .schema("development")
      .from("attendance_sessions")
      .select(`
        id,
        title,
        status
      `)
      .eq("id", session_id)
      .maybeSingle()

    if (sessionError) {
      console.error(
        "[ATTENDANCE] Completion lookup failed:",
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

    if (session.status !== "open") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only open sessions can be completed.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * Actualización condicional:
     * si otra solicitud la completó primero,
     * no se actualizará ninguna fila.
     */
    const {
      data: completedSession,
      error: completionError,
    } = await supabaseAdmin
      .schema("development")
      .from("attendance_sessions")
      .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          completed_by: boardMember.id,
          updated_at: new Date().toISOString(),

        /*
         * Si tu tabla ya contiene estas columnas,
         * puedes habilitarlas:
         *
         * completed_at:
         *   new Date().toISOString(),
         *
         * completed_by:
         *   boardMember.id,
         */
      })
      .eq("id", session_id)
      .eq("status", "open")
      .select(`
        id,
        title,
        status,
        scheduled_at,
        counts_for_score
      `)
      .maybeSingle()

    if (completionError) {
      console.error(
        "[ATTENDANCE] Complete session failed:",
        completionError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to complete attendance session.",
        },
        {
          status: 500,
        }
      )
    }

    if (!completedSession) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The session is no longer open. Refresh the page and try again.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * Obtenemos el resumen final después de completar.
     * Ahora unmarked se refleja también como absent.
     */
    const finalResult =
      await getSessionAttendance(
        session_id
      )

    return NextResponse.json({
      success: true,
      session: completedSession,
      summary: finalResult.summary,
      completedBy: boardMember.id,
    })
  } catch (error) {
    console.error(
      "[ATTENDANCE] Complete session API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to complete attendance session."

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