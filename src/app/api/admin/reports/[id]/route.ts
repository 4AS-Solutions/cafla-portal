import { NextResponse } from "next/server"

import { sendApprovedReportNotification } from "@/src/emails/services/send-approved-report-notification"
import { requireBoardApi } from "@/src/lib/auth/require-board-api"
import { supabaseServer } from "@/src/lib/supabase/server"

type ReportStatus =
  | "approved"
  | "revision_required"

type RequestBody = {
  status?: ReportStatus
  revision_notes?: string
}

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{ id: string }>
  }
) {
  try {
    // =========================================
    // 🔐 BOARD AUTHORIZATION
    // =========================================
    await requireBoardApi()

    const { id } = await context.params
    const reportId = id?.trim()

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: "Report ID is required.",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================
    // 📥 REQUEST BODY
    // =========================================
    let body: RequestBody

    try {
      body = (await req.json()) as RequestBody
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "A valid JSON body is required.",
        },
        {
          status: 400,
        }
      )
    }

    const status = body.status
    const revisionNotes =
      body.revision_notes?.trim() ?? ""

    if (
      status !== "approved" &&
      status !== "revision_required"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid report status.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      status === "revision_required" &&
      !revisionNotes
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Revision notes are required when returning a report for review.",
        },
        {
          status: 400,
        }
      )
    }

    const supabase = await supabaseServer()

    // =========================================
    // 🔎 LOAD CURRENT REPORT
    // =========================================
    const {
      data: currentReport,
      error: currentReportError,
    } = await supabase
      .from("match_reports")
      .select("id, match_id, status")
      .eq("id", reportId)
      .maybeSingle()

    if (currentReportError) {
      console.error(
        "Unable to load report before status update:",
        currentReportError
      )

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load the report.",
        },
        {
          status: 500,
        }
      )
    }

    if (!currentReport) {
      return NextResponse.json(
        {
          success: false,
          error: "Report not found.",
        },
        {
          status: 404,
        }
      )
    }

    // Prevent duplicate approval emails caused by
    // repeated clicks or repeated requests.
    if (
      status === "approved" &&
      currentReport.status === "approved"
    ) {
      return NextResponse.json({
        success: true,
        alreadyApproved: true,
        emailSent: false,
        message:
          "This report was already approved.",
      })
    }

    // =========================================
    // 📝 UPDATE MATCH REPORT
    // =========================================
    const reportUpdate =
      status === "approved"
        ? {
            status: "approved",
            revision_notes: null,
          }
        : {
            status: "revision_required",
            revision_notes: revisionNotes,
          }

    const { error: reportUpdateError } =
      await supabase
        .from("match_reports")
        .update(reportUpdate)
        .eq("id", reportId)

    if (reportUpdateError) {
      console.error(
        "Unable to update match report:",
        reportUpdateError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to update the report status.",
        },
        {
          status: 500,
        }
      )
    }

    // =========================================
    // ✉️ APPROVED REPORT EMAIL
    // =========================================
    if (status === "approved") {
      try {
        const notification =
          await sendApprovedReportNotification(
            reportId
          )

        return NextResponse.json({
          success: true,
          emailSent: true,
          message:
            "Report approved and email sent successfully.",
          emailId: notification.emailId,
          recipient: notification.recipient,
          attachmentsCount:
            notification.attachmentsCount,
        })
      } catch (emailError) {
        /*
         * The report remains approved even if Resend
         * or Storage fails. Approval and email delivery
         * are separate business operations.
         */
        console.error(
          "Report approved, but email delivery failed:",
          emailError
        )

        const emailErrorMessage =
          emailError instanceof Error
            ? emailError.message
            : "Unknown email delivery error."

        return NextResponse.json({
          success: true,
          emailSent: false,
          message:
            "Report approved, but the notification email could not be sent.",
          emailError: emailErrorMessage,
        })
      }
    }

    // =========================================
    // 🔁 REVISION REQUIRED
    // =========================================
    return NextResponse.json({
      success: true,
      emailSent: false,
      message:
        "Report returned for revision successfully.",
    })
  } catch (error) {
    console.error(
      "Admin report status route error:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unknown server error."

    if (message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication is required.",
        },
        {
          status: 401,
        }
      )
    }

    if (message === "Forbidden") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Board access is required.",
        },
        {
          status: 403,
        }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Server error.",
      },
      {
        status: 500,
      }
    )
  }
}