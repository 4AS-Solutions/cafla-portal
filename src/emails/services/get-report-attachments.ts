import "server-only"

import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

import type {
  ReportAttachment,
} from "../types/report-approved.types"

const ROSTER_BUCKET = "match-rosters"

type AvailableRosterAttachment = {
  assetType:
    | "roster_combined"
    | "roster_home"
    | "roster_away"
  storagePath: string
}

type MatchNames = {
  homeTeamName: string
  awayTeamName: string
}

type DownloadedReportAttachment =
  ReportAttachment & {
    content: Buffer
  }

function getFileExtension(storagePath: string): string {
  const filename = storagePath.split("/").pop() ?? ""
  const dotIndex = filename.lastIndexOf(".")

  if (dotIndex === -1) {
    return ""
  }

  return filename.slice(dotIndex).toLowerCase()
}

function getFilename(
  attachment: AvailableRosterAttachment,
  match: MatchNames
): string {
  const extension =
    getFileExtension(attachment.storagePath)

  switch (attachment.assetType) {
    case "roster_home":
      return `${match.homeTeamName} Roster${extension}`

    case "roster_away":
      return `${match.awayTeamName} Roster${extension}`

    case "roster_combined":
      return `${match.homeTeamName} vs ${match.awayTeamName} Rosters${extension}`

    default:
      return `Match Roster${extension}`
  }
}

export async function getReportAttachments({
  rosterAttachments,
  homeTeamName,
  awayTeamName,
}: {
  rosterAttachments: AvailableRosterAttachment[]
  homeTeamName: string
  awayTeamName: string
}): Promise<ReportAttachment[]> {
  const supabase = getSupabaseAdmin()

    const results: Array<
        DownloadedReportAttachment | null
        > = await Promise.all(
        rosterAttachments.map(
            async (
            attachment
            ): Promise<DownloadedReportAttachment | null> => {
            const { data, error } =
                await supabase.storage
                .from(ROSTER_BUCKET)
                .download(attachment.storagePath)

            console.log("Downloading roster:", {
              bucket: ROSTER_BUCKET,
              assetType: attachment.assetType,
              storagePath: attachment.storagePath,
            })

            if (error) {
                console.error(
                `Unable to download roster ${attachment.storagePath}:`,
                error
                )

                return null
            }

            console.log("Roster downloaded successfully:", {
              storagePath: attachment.storagePath,
              size: data.size,
              type: data.type,
            })

            const arrayBuffer =
                await data.arrayBuffer()

            return {
                filename: getFilename(
                attachment,
                {
                    homeTeamName,
                    awayTeamName,
                }
                ),
                content: Buffer.from(
                new Uint8Array(arrayBuffer)
                ),
            }
            }
        )
    )

    return results.filter(
    (
        attachment
    ): attachment is DownloadedReportAttachment =>
        attachment !== null
    )
}