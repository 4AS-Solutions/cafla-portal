import { NextResponse } from "next/server"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

const allowedEnrollmentTypes = [
  "existing_member",
  "new_member",
] as const

type EnrollmentType =
  (typeof allowedEnrollmentTypes)[number]

type InviteMemberBody = {
  email?: unknown
  full_name?: unknown
  enrollment_type?: unknown
}

export async function POST(req: Request) {
  try {
    // =========================================
    // 🔐 BOARD AUTHORIZATION
    // =========================================
    await requireBoard()

    const supabase = getSupabaseAdmin()

    // =========================================
    // 📥 REQUEST BODY
    // =========================================
    let body: InviteMemberBody

    try {
      body = (await req.json()) as InviteMemberBody
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

    const email =
      String(body.email ?? "")
        .trim()
        .toLowerCase()

    const fullName =
      String(body.full_name ?? "")
        .trim()

    const enrollmentType =
      String(
        body.enrollment_type ?? ""
      ).trim() as EnrollmentType

    // =========================================
    // ✅ VALIDATION
    // =========================================
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required.",
        },
        {
          status: 400,
        }
      )
    }

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name is required.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !allowedEnrollmentTypes.includes(
        enrollmentType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid enrollment type is required.",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================
    // 🔎 ACTIVE DEVELOPMENT CYCLE
    // =========================================
    const {
      data: activeCycle,
      error: cycleError,
    } = await supabase
      .schema("development")
      .from("cycles")
      .select(`
        id,
        name,
        start_date,
        end_date,
        status
      `)
      .eq("status", "active")
      .order("start_date", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

    if (cycleError) {
      console.error(
        "[MEMBER INVITE] Active cycle lookup error:",
        cycleError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load the active Development cycle.",
        },
        {
          status: 500,
        }
      )
    }

    if (!activeCycle) {
      return NextResponse.json(
        {
          success: false,
          error:
            "There is no active Development cycle. Activate a cycle before inviting members.",
        },
        {
          status: 409,
        }
      )
    }

    // =========================================
    // ✉️ SUPABASE AUTH INVITATION
    // =========================================
    const {
      data: inviteData,
      error: inviteError,
    } =
      await supabase.auth.admin
        .inviteUserByEmail(
          email,
          {
            data: {
              full_name: fullName,
            },
            redirectTo:
              `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
          }
        )

    if (inviteError) {
      console.error(
        "[MEMBER INVITE] Auth invitation error:",
        inviteError
      )

      return NextResponse.json(
        {
          success: false,
          error: inviteError.message,
        },
        {
          status: 400,
        }
      )
    }

    const invitedUserId =
      inviteData.user?.id

    if (!invitedUserId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The invitation was created without a valid member ID.",
        },
        {
          status: 500,
        }
      )
    }

    // =========================================
    // 🔎 CHECK DEVELOPMENT ENROLLMENT
    // =========================================
    const {
      data: existingEnrollment,
      error: enrollmentLookupError,
    } = await supabase
      .schema("development")
      .from("cycle_members")
      .select(`
        id,
        cycle_id,
        member_id,
        status,
        enrollment_type
      `)
      .eq(
        "cycle_id",
        activeCycle.id
      )
      .eq(
        "member_id",
        invitedUserId
      )
      .maybeSingle()

    if (enrollmentLookupError) {
      console.error(
        "[MEMBER INVITE] Enrollment lookup error:",
        enrollmentLookupError
      )

      return NextResponse.json(
        {
          success: false,
          invitationSent: true,
          developmentEnrolled: false,
          error:
            "The invitation was sent, but Development enrollment could not be verified.",
        },
        {
          status: 500,
        }
      )
    }

    // =========================================
    // 🧠 DEVELOPMENT ENROLLMENT
    // =========================================
    if (!existingEnrollment) {
      const {
        error: enrollmentError,
      } = await supabase
        .schema("development")
        .from("cycle_members")
        .insert({
          cycle_id:
            activeCycle.id,

          member_id:
            invitedUserId,

          effective_from:
            new Date()
              .toISOString()
              .slice(0, 10),

          effective_until:
            null,

          enrollment_type:
            enrollmentType,

          status:
            "active",

          eligible_for_ranking:
            true,

          notes:
            `Added through Member Invitation - ${activeCycle.name}`,

          updated_at:
            new Date().toISOString(),
        })

      if (enrollmentError) {
        console.error(
          "[MEMBER INVITE] Development enrollment error:",
          enrollmentError
        )

        /*
         * IMPORTANT:
         * The Supabase Auth invitation has already
         * succeeded at this point.
         *
         * We return the partial state explicitly
         * instead of pretending everything worked.
         */
        return NextResponse.json(
          {
            success: false,
            invitationSent: true,
            developmentEnrolled: false,
            memberId:
              invitedUserId,
            error:
              "The member was invited, but could not be enrolled in the Development cycle.",
          },
          {
            status: 500,
          }
        )
      }
    }

    // =========================================
    // ✅ SUCCESS
    // =========================================
    return NextResponse.json({
      success: true,

      invitationSent: true,

      developmentEnrolled: true,

      member: {
        id:
          invitedUserId,
        email,
        fullName,
      },

      development: {
        cycleId:
          activeCycle.id,

        cycleName:
          activeCycle.name,

        enrollmentType,

        status:
          "active",

        eligibleForRanking:
          true,
      },
    })
  } catch (error) {
    console.error(
      "[MEMBER INVITE] API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to invite member."

    if (
      message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Authentication is required.",
        },
        {
          status: 401,
        }
      )
    }

    if (
      message === "Forbidden"
    ) {
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
        error: message,
      },
      {
        status: 500,
      }
    )
  }
}