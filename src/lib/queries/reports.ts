import { supabaseServer } from "@/src/lib/supabase/server"

const ROSTER_BUCKET = "match-rosters"
const SIGNED_URL_EXPIRATION_SECONDS = 60 * 10

const ROSTER_ASSET_TYPES = [
  "roster_combined",
  "roster_home",
  "roster_away",
] as const

type RosterAssetType =
  (typeof ROSTER_ASSET_TYPES)[number]

function isRosterAssetType(
  value: unknown
): value is RosterAssetType {
  return (
    typeof value === "string" &&
    ROSTER_ASSET_TYPES.includes(
      value as RosterAssetType
    )
  )
}

export async function getMatchForReport(
  matchId: string
) {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      match_reports (
        id,
        status,
        home_score,
        away_score,
        comments,
        submitted_at,
        revision_notes,

        report_goals (*),
        report_cards (*),
        report_injuries (*),
        report_assets (*)
      )
    `)
    .eq("id", matchId)
    .maybeSingle()

  if (error) {
    console.error(error)
    throw error
  }

  const rawReport = data?.match_reports ?? null

  if (!rawReport) {
    return {
      match: data,
      report: null,
    }
  }

  const rosterAssets =
    (rawReport.report_assets ?? []).filter(
      (asset: any) =>
        isRosterAssetType(asset.asset_type) &&
        typeof asset.storage_path === "string" &&
        asset.storage_path.trim().length > 0
    )

  const signedRosterAssets =
    await Promise.all(
      rosterAssets.map(async (asset: any) => {
        const { data: signedData, error: signedError } =
          await supabase.storage
            .from(ROSTER_BUCKET)
            .createSignedUrl(
              asset.storage_path,
              SIGNED_URL_EXPIRATION_SECONDS
            )

        if (signedError) {
          console.error(
            `Unable to create signed URL for roster asset ${asset.id}:`,
            signedError
          )

          return {
            id: asset.id,
            asset_type: asset.asset_type,
            storage_path: asset.storage_path,
            uploaded_at:
              asset.uploaded_at ?? null,
            signed_url: null,
          }
        }

        return {
          id: asset.id,
          asset_type: asset.asset_type,
          storage_path: asset.storage_path,
          uploaded_at:
            asset.uploaded_at ?? null,
          signed_url: signedData.signedUrl,
        }
      })
    )

  const report = {
    ...rawReport,
    goals: rawReport.report_goals ?? [],
    cards: rawReport.report_cards ?? [],
    injuries:
      rawReport.report_injuries ?? [],

    assets: signedRosterAssets,
  }

  return {
    match: data,
    report,
  }
}