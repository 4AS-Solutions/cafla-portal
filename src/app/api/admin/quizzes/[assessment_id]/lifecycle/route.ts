import { requireBoard } from "@/src/lib/auth/require-board";
import { getSupabaseAdmin } from "@/src/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";



type LifecycleAction = "close" | "archive";

type RouteContext = {
  params: Promise<{
    assessment_id: string;
  }>;
};

type LifecycleRequestBody = {
  action?: LifecycleAction;
};

type AssessmentStatus = "draft" | "published" | "closed" | "archived";

type AssessmentRecord = {
  id: string;
  title: string;
  status: AssessmentStatus;
  closed_at: string | null;
  archived_at: string | null;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const boardMember = await requireBoard();
    const { assessment_id } = await context.params;

    if (!assessment_id) {
      return NextResponse.json(
        {
          error: "Assessment ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    let body: LifecycleRequestBody;

    try {
      body = (await request.json()) as LifecycleRequestBody;
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON body.",
        },
        {
          status: 400,
        }
      );
    }

    const { action } = body;

    if (action !== "close" && action !== "archive") {
      return NextResponse.json(
        {
          error: 'Action must be either "close" or "archive".',
        },
        {
          status: 400,
        }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: assessment, error: assessmentError } = await supabase
      .schema("development")
      .from("quiz_assessments")
      .select(`
        id,
        title,
        status,
        closed_at,
        archived_at
      `)
      .eq("id", assessment_id)
      .maybeSingle<AssessmentRecord>();

    if (assessmentError) {
      console.error("[QUIZ LIFECYCLE] Assessment lookup error:", {
        assessmentId: assessment_id,
        action,
        error: assessmentError,
      });

      return NextResponse.json(
        {
          error: "Unable to load assessment.",
        },
        {
          status: 500,
        }
      );
    }

    if (!assessment) {
      return NextResponse.json(
        {
          error: "Assessment not found.",
        },
        {
          status: 404,
        }
      );
    }

    const now = new Date().toISOString();

    if (action === "close") {
      if (assessment.status === "closed") {
        return NextResponse.json(
          {
            success: true,
            message: "Assessment is already closed.",
            assessment,
          },
          {
            status: 200,
          }
        );
      }

      if (assessment.status !== "published") {
        return NextResponse.json(
          {
            error: "Only a published assessment can be closed.",
            currentStatus: assessment.status,
            requiredStatus: "published",
          },
          {
            status: 409,
          }
        );
      }

      const { data: updatedAssessment, error: updateError } =
        await supabase
          .schema("development")
          .from("quiz_assessments")
          .update({
            status: "closed",
            closed_by: boardMember.id,
            closed_at: now,
            updated_at: now,
          })
          .eq("id", assessment_id)
          .eq("status", "published")
          .select(`
            id,
            title,
            status,
            closed_at,
            archived_at
          `)
          .maybeSingle<AssessmentRecord>();

      if (updateError) {
        console.error("[QUIZ LIFECYCLE] Close error:", {
          assessmentId: assessment_id,
          boardMemberId: boardMember.id,
          error: updateError,
        });

        return NextResponse.json(
          {
            error: "Unable to close assessment.",
          },
          {
            status: 500,
          }
        );
      }

      if (!updatedAssessment) {
        return NextResponse.json(
          {
            error:
              "Assessment status changed before the close operation completed. Refresh and try again.",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Assessment closed successfully.",
          assessment: updatedAssessment,
        },
        {
          status: 200,
        }
      );
    }

    if (assessment.status === "archived") {
      return NextResponse.json(
        {
          success: true,
          message: "Assessment is already archived.",
          assessment,
        },
        {
          status: 200,
        }
      );
    }

    if (assessment.status !== "closed") {
      return NextResponse.json(
        {
          error: "Only a closed assessment can be archived.",
          currentStatus: assessment.status,
          requiredStatus: "closed",
        },
        {
          status: 409,
        }
      );
    }

    const { data: updatedAssessment, error: updateError } =
      await supabase
        .schema("development")
        .from("quiz_assessments")
        .update({
          status: "archived",
          archived_by: boardMember.id,
          archived_at: now,
          updated_at: now,
        })
        .eq("id", assessment_id)
        .eq("status", "closed")
        .select(`
          id,
          title,
          status,
          closed_at,
          archived_at
        `)
        .maybeSingle<AssessmentRecord>();

    if (updateError) {
      console.error("[QUIZ LIFECYCLE] Archive error:", {
        assessmentId: assessment_id,
        boardMemberId: boardMember.id,
        error: updateError,
      });

      return NextResponse.json(
        {
          error: "Unable to archive assessment.",
        },
        {
          status: 500,
        }
      );
    }

    if (!updatedAssessment) {
      return NextResponse.json(
        {
          error:
            "Assessment status changed before the archive operation completed. Refresh and try again.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Assessment archived successfully.",
        assessment: updatedAssessment,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("[QUIZ LIFECYCLE] API failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unexpected lifecycle operation error.";

    const isAuthenticationError =
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("authentication");

    const isAuthorizationError =
      message.toLowerCase().includes("forbidden") ||
      message.toLowerCase().includes("board");

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: isAuthenticationError
          ? 401
          : isAuthorizationError
            ? 403
            : 500,
      }
    );
  }
}