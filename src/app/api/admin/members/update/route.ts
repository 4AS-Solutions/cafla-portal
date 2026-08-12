import { NextResponse } from "next/server"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

const allowedRoles = [
  "member",
  "board",
] as const

const allowedMemberStatuses = [
  "invited",
  "active",
  "inactive",
  "suspended",
] as const

type MemberRole =
  (typeof allowedRoles)[number]

type MemberStatus =
  (typeof allowedMemberStatuses)[number]

type UpdateMemberBody = {
  member_id?: unknown
  full_name?: unknown
  phone?: unknown
  ussf_id?: unknown
  grade?: unknown
  category?: unknown
  years_in_cafla?: unknown
  role?: unknown
  status?: unknown
}

export async function POST(
  request: Request
) {
  try {
    // =========================================
    // 🔐 BOARD AUTHORIZATION
    // =========================================

    await requireBoard()

    const supabase =
      getSupabaseAdmin()

    // =========================================
    // 📥 BODY
    // =========================================

    let body: UpdateMemberBody

    try {
      body =
        (await request.json()) as UpdateMemberBody
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid JSON body is required.",
        },
        {
          status: 400,
        }
      )
    }

    const memberId =
      String(
        body.member_id ?? ""
      ).trim()

    const fullName =
      String(
        body.full_name ?? ""
      ).trim()

    const phone =
      String(
        body.phone ?? ""
      ).trim()

    const ussfId =
      String(
        body.ussf_id ?? ""
      ).trim()

    const grade =
      String(
        body.grade ?? ""
      ).trim()

    const category =
      String(
        body.category ?? ""
      ).trim()

    const yearsInCafla =
      Number(
        body.years_in_cafla ?? 0
      )

    const role =
      String(
        body.role ?? ""
      ).trim() as MemberRole

    const status =
      String(
        body.status ?? ""
      ).trim() as MemberStatus

    // =========================================
    // ✅ VALIDATION
    // =========================================

    if (!memberId) {
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

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Full name is required.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !allowedRoles.includes(role)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid member role.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !allowedMemberStatuses.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid member status.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !Number.isFinite(
        yearsInCafla
      ) ||
      yearsInCafla < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Years in CAFLA must be a valid number.",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================
    // 👤 CURRENT MEMBER
    // =========================================

    const {
      data: existingMember,
      error: memberLookupError,
    } = await supabase
      .from("members")
      .select(`
        id,
        role,
        status
      `)
      .eq(
        "id",
        memberId
      )
      .maybeSingle()

    if (memberLookupError) {
      console.error(
        "[MEMBER UPDATE] Member lookup error:",
        memberLookupError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load the member.",
        },
        {
          status: 500,
        }
      )
    }

    if (!existingMember) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Member not found.",
        },
        {
          status: 404,
        }
      )
    }

    // =========================================
    // 🛡️ MAXIMUM 5 BOARD MEMBERS
    // =========================================
    //
    // IMPORTANT:
    // We exclude the member currently being
    // edited from the count.
    //
    // Therefore:
    //
    // Board → Board
    // does not count as adding another Board.
    //
    // Member → Board
    // still respects the maximum of 5.
    // =========================================

    if (role === "board") {
      const {
        count,
        error: boardCountError,
      } = await supabase
        .from("members")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "role",
          "board"
        )
        .neq(
          "id",
          memberId
        )

      if (boardCountError) {
        console.error(
          "[MEMBER UPDATE] Board count error:",
          boardCountError
        )

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to validate Board capacity.",
          },
          {
            status: 500,
          }
        )
      }

      if (
        (count ?? 0) >= 5
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Maximum number of Board members reached.",
          },
          {
            status: 409,
          }
        )
      }
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
        end_date
      `)
      .eq(
        "status",
        "active"
      )
      .order(
        "start_date",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle()

    if (cycleError) {
      console.error(
        "[MEMBER UPDATE] Active cycle lookup error:",
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
            "There is no active Development cycle.",
        },
        {
          status: 409,
        }
      )
    }

    // =========================================
    // 🔎 DEVELOPMENT ENROLLMENT
    // =========================================

    const {
      data: cycleMember,
      error: enrollmentError,
    } = await supabase
      .schema("development")
      .from("cycle_members")
      .select(`
        id,
        cycle_id,
        member_id,
        effective_from,
        effective_until,
        enrollment_type,
        status,
        eligible_for_ranking
      `)
      .eq(
        "cycle_id",
        activeCycle.id
      )
      .eq(
        "member_id",
        memberId
      )
      .maybeSingle()

    if (enrollmentError) {
      console.error(
        "[MEMBER UPDATE] Development enrollment lookup error:",
        enrollmentError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to validate Development enrollment.",
        },
        {
          status: 500,
        }
      )
    }

    /*
     * Members created through Members V2 should
     * already have a cycle_members record.
     *
     * We deliberately DO NOT silently create one
     * here because we do not know whether a legacy
     * member should be existing_member or new_member.
     */
    if (
      !cycleMember &&
      status !== "invited"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This member is not enrolled in the active Development cycle.",
        },
        {
          status: 409,
        }
      )
    }

    // =========================================
    // 🕒 CAFLA LOCAL DATE
    // =========================================

    const now =
      new Date()

    const losAngelesDate =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "America/Los_Angeles",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      ).format(now)

    // =========================================
    // 🧠 DEVELOPMENT STATUS
    // =========================================

    if (
      cycleMember &&
      status !== "invited"
    ) {
      let developmentStatus:
        | "active"
        | "withdrawn"
        | "ineligible"

      let eligibleForRanking:
        boolean

      let effectiveUntil:
        string | null

      switch (status) {
        // =====================================
        // ACTIVE
        // =====================================

        case "active":
          developmentStatus =
            "active"

          eligibleForRanking =
            true

          effectiveUntil =
            null

          break

        // =====================================
        // INACTIVE
        // =====================================

        case "inactive":
          developmentStatus =
            "withdrawn"

          eligibleForRanking =
            false

          effectiveUntil =
            losAngelesDate

          break

        // =====================================
        // SUSPENDED
        // =====================================

        case "suspended":
          developmentStatus =
            "ineligible"

          eligibleForRanking =
            false

          /*
           * Suspended does NOT mean the member
           * left CAFLA.
           *
           * Therefore we do not close the
           * enrollment period.
           */
          effectiveUntil =
            null

          break

        default:
          throw new Error(
            "Unsupported member status."
          )
      }

      const {
        error:
          developmentUpdateError,
      } = await supabase
        .schema("development")
        .from("cycle_members")
        .update({
          status:
            developmentStatus,

          eligible_for_ranking:
            eligibleForRanking,

          effective_until:
            effectiveUntil,

          updated_at:
            now.toISOString(),
        })
        .eq(
          "id",
          cycleMember.id
        )

      if (
        developmentUpdateError
      ) {
        console.error(
          "[MEMBER UPDATE] Development update error:",
          developmentUpdateError
        )

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to update the member's Development enrollment.",
          },
          {
            status: 500,
          }
        )
      }
    }

    // =========================================
    // ✏️ PUBLIC MEMBER UPDATE
    // =========================================

    const {
      error: updateError,
    } = await supabase
      .from("members")
      .update({
        full_name:
          fullName,

        phone:
          phone || null,

        ussf_id:
          ussfId || null,

        grade:
          grade || null,

        category:
          category || null,

        years_in_cafla:
          yearsInCafla,

        role,

        status,
      })
      .eq(
        "id",
        memberId
      )

    if (updateError) {
      console.error(
        "[MEMBER UPDATE] Member update error:",
        updateError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to update member.",
        },
        {
          status: 500,
        }
      )
    }

    // =========================================
    // ✅ SUCCESS
    // =========================================

    return NextResponse.json({
      success: true,

      member: {
        id:
          memberId,

        role,

        status,
      },

      development:
        cycleMember
          ? {
              cycleId:
                activeCycle.id,

              enrollmentType:
                cycleMember.enrollment_type,
            }
          : null,
    })
  } catch (error) {
    console.error(
      "[MEMBER UPDATE] API failed:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Unable to update member."

    if (
      message ===
      "Unauthorized"
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
      message ===
      "Forbidden"
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