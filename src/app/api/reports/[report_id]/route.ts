import { supabaseServer } from "@/src/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ report_id: string }> }
) {
  const { report_id } = await context.params

  const supabase = await supabaseServer()
  const body = await req.json()

  const {
    home_score,
    away_score,
    comments,
    goals,
    cards,
    injuries,
    assets,
  } = body

  // 🔥 1. UPDATE MAIN REPORT
  const { data: updatedRows, error: reportError } = await supabase
    .from("match_reports")
    .update({
      home_score,
      away_score,
      comments,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", report_id)
    .select("id, match_id, status")

  if (reportError) {
    return NextResponse.json(
      { error: reportError.message },
      { status: 500 }
    )
  }

  if (!updatedRows || updatedRows.length === 0) {
    return NextResponse.json(
      { error: "Report was not updated or is not accessible by current policies." },
      { status: 400 }
    )
  }

  if (updatedRows.length > 1) {
    return NextResponse.json(
      { error: "More than one report row was updated unexpectedly." },
      { status: 500 }
    )
  }

  const updatedReport = updatedRows[0]

  // =====================================================
  // 🔥 HELPER FUNCTION (EVITA DUPLICADOS SIEMPRE)
  // =====================================================

  async function replaceTable(
    table: string,
    data: any[] | undefined,
    mapFn: (item: any) => any
  ) {
    const { data: deleted, error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq("report_id", report_id)
      .select()

    console.log(`DELETED ${table.toUpperCase()}:`, deleted)

    if (deleteError) {
      throw new Error(`Delete failed on ${table}: ${deleteError.message}`)
    }

    if (data && data.length > 0) {
      const { error: insertError } = await supabase
        .from(table)
        .insert(data.map(mapFn))

      if (insertError) {
        throw new Error(`Insert failed on ${table}: ${insertError.message}`)
      }
    }
  }

  try {
    // 🔥 GOALS
    if (goals !== undefined) {
      await replaceTable("report_goals", goals, (g) => ({
        report_id,
        team: g.team,
        player_name: g.player_name,
        player_number: g.player_number,
        minute: Number(g.minute),
        half: g.half,
        goal_type: g.goal_type,
      }))
    }

    // 🔥 CARDS
    if (cards !== undefined) {
      await replaceTable("report_cards", cards, (c) => ({
        report_id,
        team: c.team,
        player_name: c.player_name,
        player_number: c.player_number,
        minute: Number(c.minute),
        card_type: c.card_type,
        reason_code: c.reason_code,
        notes: c.notes || null,
      }))
    }

    // 🔥 INJURIES
    if (injuries !== undefined) {
      await replaceTable("report_injuries", injuries, (i) => ({
        report_id,
        ...i,
      }))
    }

    // 🔥 ASSETS
    if (assets !== undefined) {
      await replaceTable("report_assets", assets, (a) => ({
        report_id,
        ...a,
      }))
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    report_id: updatedReport.id,
    status: updatedReport.status,
  })
}