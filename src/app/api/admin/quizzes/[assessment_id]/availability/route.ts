import { NextResponse } from "next/server"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type RouteContext = {
  params: Promise<{
    assessment_id: string
  }>
}

type UpdateAvailabilityBody = {
  open_from?: unknown
  open_until?: unknown
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    await requireBoard()

    const { assessment_id } =
      await context.params

    if (!assessment_id) {
      return validationError(
        "Assessment ID is required."
      )
    }

    const body =
      (await request.json()) as UpdateAvailabilityBody

    const openFrom = String(
      body.open_from ?? ""
    ).trim()

    const openUntil = String(
      body.open_until ?? ""
    ).trim()

    const openFromDate =
      new Date(openFrom)

    const openUntilDate =
      new Date(openUntil)

    if (
      !openFrom ||
      Number.isNaN(
        openFromDate.getTime()
      )
    ) {
      return validationError(
        "A valid opening date is required."
      )
    }

    if (
      !openUntil ||
      Number.isNaN(
        openUntilDate.getTime()
      )
    ) {
      return validationError(
        "A valid closing date is required."
      )
    }

    if (
      openFromDate.getTime() >=
      openUntilDate.getTime()
    ) {
      return validationError(
        "The closing date must be after the opening date."
      )
    }

    const supabaseAdmin =
      getSupabaseAdmin()

    const {
      data: assessment,
      error: assessmentError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_assessments")
      .select(`
        id,
        status,
        open_from,
        open_until
      `)
      .eq("id", assessment_id)
      .maybeSingle()

    if (assessmentError) {
      console.error(
        "[QUIZ AVAILABILITY] Assessment lookup error:",
        assessmentError
      )

      throw new Error(
        "Unable to load the assessment."
      )
    }

    if (!assessment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assessment not found.",
        },
        {
          status: 404,
        }
      )
    }

    if (
      assessment.status ===
      "archived"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Archived assessments cannot be modified.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * Closed assessments may still have
     * their dates corrected administratively,
     * but this does not automatically reopen
     * the lifecycle status.
     */
    const {
      data: updatedAssessment,
      error: updateError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_assessments")
      .update({
        open_from:
          openFromDate.toISOString(),

        open_until:
          openUntilDate.toISOString(),

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", assessment_id)
      .select(`
        id,
        status,
        open_from,
        open_until,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error(
        "[QUIZ AVAILABILITY] Update error:",
        updateError
      )

      throw new Error(
        "Unable to update assessment availability."
      )
    }

    return NextResponse.json({
      success: true,
      assessment:
        updatedAssessment,
    })
  } catch (error) {
    console.error(
      "[QUIZ AVAILABILITY] API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to update assessment availability."

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

function validationError(
  message: string
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status: 400,
    }
  )
}