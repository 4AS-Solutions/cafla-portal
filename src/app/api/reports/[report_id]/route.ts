import { NextResponse } from "next/server"

import { supabaseServer } from "@/src/lib/supabase/server"

type RosterAssetType =
  | "roster_combined"
  | "roster_home"
  | "roster_away"

type ReportAssetInput = {
  asset_type: RosterAssetType
  storage_path: string
}

type ReportUpdateBody = {
  comments?: string | null
  goals?: any[]
  cards?: any[]
  injuries?: any[]
  assets?: ReportAssetInput[]
}

const VALID_ROSTER_ASSET_TYPES: RosterAssetType[] = [
  "roster_combined",
  "roster_home",
  "roster_away",
]

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{ report_id: string }>
  }
) {
  try {
    const { report_id } = await context.params
    const reportId = report_id?.trim()

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

    const supabase = await supabaseServer()

    let body: ReportUpdateBody

    try {
      body = (await req.json()) as ReportUpdateBody
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

    const {
      comments,
      goals = [],
      cards = [],
      injuries,
      assets,
    } = body

    // =============================================
    // VALIDATE CURRENT REPORT
    // =============================================

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
        "Unable to load report before resubmission:",
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

    if (
      currentReport.status !== "revision_required"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only reports requiring revision can be edited and resubmitted.",
        },
        {
          status: 409,
        }
      )
    }

    // =============================================
    // VALIDATE ASSETS
    // =============================================

    if (assets !== undefined) {
      const invalidAsset = assets.find(
        (asset) =>
          !VALID_ROSTER_ASSET_TYPES.includes(
            asset.asset_type
          ) ||
          typeof asset.storage_path !== "string" ||
          asset.storage_path.trim().length === 0
      )

      if (invalidAsset) {
        return NextResponse.json(
          {
            success: false,
            error:
              "One or more roster attachments are invalid.",
          },
          {
            status: 400,
          }
        )
      }

      const assetTypes = assets.map(
        (asset) => asset.asset_type
      )

      if (
        new Set(assetTypes).size !==
        assetTypes.length
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Duplicate roster attachment types are not allowed.",
          },
          {
            status: 400,
          }
        )
      }
    }

    // =============================================
    // AUTO-CALCULATE SCORE
    // =============================================

    const homeScore = goals.filter(
      (goal: any) => goal.team === "home"
    ).length

    const awayScore = goals.filter(
      (goal: any) => goal.team === "away"
    ).length

    // =============================================
    // REPLACE CHILD TABLE HELPER
    // =============================================

    async function replaceTable(
      table: string,
      rows: any[] | undefined,
      mapRow: (item: any) => any
    ) {
      if (rows === undefined) {
        return
      }

      const { error: deleteError } =
        await supabase
          .from(table)
          .delete()
          .eq("report_id", reportId)

      if (deleteError) {
        throw new Error(
          `Delete failed on ${table}: ${deleteError.message}`
        )
      }

      if (rows.length === 0) {
        return
      }

      const { error: insertError } =
        await supabase
          .from(table)
          .insert(rows.map(mapRow))

      if (insertError) {
        throw new Error(
          `Insert failed on ${table}: ${insertError.message}`
        )
      }
    }

    // =============================================
    // UPDATE REPORT DATA
    // =============================================

    try {
      await replaceTable(
        "report_goals",
        goals,
        (goal) => ({
          report_id: reportId,
          team: goal.team,
          player_id: goal.player_id ?? null,
          player_name: goal.player_name,
          player_number: goal.player_number,
          minute: Number(goal.minute),
          half: goal.half,
          goal_type: goal.goal_type,
        })
      )

      await replaceTable(
        "report_cards",
        cards,
        (card) => ({
          report_id: reportId,
          team: card.team,
          player_id: card.player_id ?? null,
          player_name: card.player_name,
          player_number: card.player_number,
          minute: Number(card.minute),
          card_type: card.card_type,
          reason_code: card.reason_code,
          notes: card.notes?.trim() || null,
        })
      )

      await replaceTable(
        "report_injuries",
        injuries,
        (injury) => ({
          report_id: reportId,
          ...injury,
        })
      )

      await replaceTable(
        "report_assets",
        assets,
        (asset: ReportAssetInput) => ({
          report_id: reportId,
          asset_type: asset.asset_type,
          storage_path:
            asset.storage_path.trim(),
        })
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update report details."

      console.error(
        "Unable to replace report details:",
        error
      )

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

    // =============================================
    // UPDATE MAIN REPORT
    // =============================================

    const {
      data: updatedReport,
      error: reportUpdateError,
    } = await supabase
      .from("match_reports")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        comments: comments?.trim() || "",
        status: "submitted",
        revision_notes: null,
      })
      .eq("id", reportId)
      .select("id, match_id, status")
      .maybeSingle()

    if (reportUpdateError) {
      console.error(
        "Unable to resubmit report:",
        reportUpdateError
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to resubmit the report.",
        },
        {
          status: 500,
        }
      )
    }

    if (!updatedReport) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The report was not updated or is not accessible.",
        },
        {
          status: 400,
        }
      )
    }

    return NextResponse.json({
      success: true,
      report_id: updatedReport.id,
      match_id: updatedReport.match_id,
      status: updatedReport.status,
      message:
        "Match report updated and resubmitted successfully.",
    })
  } catch (error) {
    console.error(
      "Report resubmission route error:",
      error
    )

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