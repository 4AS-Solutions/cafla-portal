import { supabaseServer } from "@/src/lib/supabase/server"
import { getMatchDetails } from "./get-match-details"

const ROSTER_BUCKET = "match-rosters"
const SIGNED_URL_EXPIRATION_SECONDS = 60 * 10

const ROSTER_ASSET_TYPES = [
  "roster_combined",
  "roster_home",
  "roster_away",
] as const

type RosterAssetType = (typeof ROSTER_ASSET_TYPES)[number]

export type RosterAttachment = {
  id: string
  assetType: RosterAssetType
  storagePath: string
  signedUrl: string
  uploadedAt: string | null
}

function isRosterAssetType(value: string): value is RosterAssetType {
  return ROSTER_ASSET_TYPES.includes(value as RosterAssetType)
}

export async function getReportDetails(matchId: string) {
  const details = await getMatchDetails(matchId)

  const supabase = await supabaseServer()

  const rosterAssets = details.assets.filter(
    (asset: any) =>
      typeof asset.asset_type === "string" &&
      isRosterAssetType(asset.asset_type) &&
      typeof asset.storage_path === "string" &&
      asset.storage_path.length > 0
  )

  const signedResults = await Promise.all(
    rosterAssets.map(async (asset: any) => {
      const { data, error } = await supabase.storage
        .from(ROSTER_BUCKET)
        .createSignedUrl(
          asset.storage_path,
          SIGNED_URL_EXPIRATION_SECONDS
        )

      if (error) {
        console.error(
          `Unable to create signed URL for roster asset ${asset.id}:`,
          error
        )

        return null
      }

      const attachment: RosterAttachment = {
        id: asset.id,
        assetType: asset.asset_type,
        storagePath: asset.storage_path,
        signedUrl: data.signedUrl,
        uploadedAt: asset.uploaded_at ?? null,
      }

      return attachment
    })
  )

  const rosterAttachments = signedResults.filter(
    (attachment): attachment is RosterAttachment =>
      attachment !== null
  )

  return {
    ...details,
    rosterAttachments,
  }
}