import "server-only"

import { mapReportToEmail } from "@/src/emails/mappers/map-report-to-email"
import { getReportAttachments } from "@/src/emails/services/get-report-attachments"
import { sendReportApprovedEmail } from "@/src/emails/services/send-report-approved-email"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"
import { getCardReasons } from "@/src/lib/queries/get-card-reasons"
import { getReportDetails } from "@/src/lib/queries/get-report-details"

const ROSTER_ASSET_TYPES = [
  "roster_combined",
  "roster_home",
  "roster_away",
] as const

type RosterAssetType =
  (typeof ROSTER_ASSET_TYPES)[number]

type AvailableRosterAsset = {
  assetType: RosterAssetType
  storagePath: string
}

type SendApprovedReportNotificationResult = {
  emailId: string
  recipient: string
  reportId: string
  matchId: string
  attachmentsCount: number
}

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

function getRequiredEnvironmentVariable(
  name: string
): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `${name} is not configured in the environment.`
    )
  }

  return value
}

export async function sendApprovedReportNotification(
  reportId: string
): Promise<SendApprovedReportNotificationResult> {
  const normalizedReportId = reportId.trim()

  if (!normalizedReportId) {
    throw new Error(
      "A report ID is required to send the approved report notification."
    )
  }

  /*
   * Obtain match_id securely from the report.
   *
   * We use the admin client here because this is an
   * internal server-only process initiated after a
   * Board authorization check.
   */
  const supabase = getSupabaseAdmin()

  const {
    data: reportReference,
    error: reportReferenceError,
  } = await supabase
    .from("match_reports")
    .select("id, match_id")
    .eq("id", normalizedReportId)
    .maybeSingle()

  if (reportReferenceError) {
    console.error(
      "Unable to find report for email notification:",
      reportReferenceError
    )

    throw new Error(
      "Unable to load the approved report."
    )
  }

  if (!reportReference) {
    throw new Error(
      `Report not found: ${normalizedReportId}`
    )
  }

  const matchId = reportReference.match_id

  /*
   * Load the report information used by the Board UI.
   *
   * This service will be invoked from the authenticated
   * Board API route, so the request has the Board session.
   */
  const details = await getReportDetails(matchId)

  if (!details.match) {
    throw new Error(
      `Match not found for report: ${normalizedReportId}`
    )
  }

  if (!details.report) {
    throw new Error(
      `Report details not found: ${normalizedReportId}`
    )
  }

  /*
   * Make sure the report loaded through match_id is
   * the same report requested by the approval route.
   */
  if (details.report.id !== normalizedReportId) {
    throw new Error(
      "The loaded report does not match the approved report."
    )
  }

  const cardReasons = await getCardReasons()

  /*
   * For email attachments, use report_assets directly.
   *
   * We do not use rosterAttachments because those include
   * signed URLs intended for browser previews. Email files
   * are downloaded securely using the Supabase admin client.
   */
  const availableRosterAssets: AvailableRosterAsset[] =
    (details.assets ?? [])
      .filter(
        (asset: any) =>
          isRosterAssetType(asset.asset_type) &&
          typeof asset.storage_path === "string" &&
          asset.storage_path.trim().length > 0
      )
      .map((asset: any) => ({
        assetType: asset.asset_type,
        storagePath: asset.storage_path.trim(),
      }))

  /*
   * Convert database/domain data into the normalized
   * structure expected by the email template.
   */
  const emailData = mapReportToEmail({
    match: details.match,
    report: details.report,
    goals: details.goals ?? [],
    cards: details.cards ?? [],
    center: details.center,
    ar1: details.ar1,
    ar2: details.ar2,
    comments: details.comments,
    cardReasons,
    rosterAttachments: availableRosterAssets,
  })

  /*
   * Download each available roster from the private
   * Supabase Storage bucket and convert it into a Buffer.
   */
  const attachments =
    await getReportAttachments({
      rosterAttachments:
        availableRosterAssets,

      homeTeamName:
        emailData.report.homeTeamName,

      awayTeamName:
        emailData.report.awayTeamName,
    })

  const recipient =
    getRequiredEnvironmentVariable(
      "REPORT_EMAIL_TO"
    )

  /*
   * Send the official email and attach every roster
   * that was successfully downloaded.
   */
  const result =
    await sendReportApprovedEmail({
      to: recipient,
      report: emailData.report,
      attachments,
    })

  console.log(
    "Approved report notification sent:",
    {
      reportId: normalizedReportId,
      matchId,
      recipient,
      emailId: result.emailId,
      attachmentsCount: attachments.length,
    }
  )

  return {
    emailId: result.emailId,
    recipient,
    reportId: normalizedReportId,
    matchId,
    attachmentsCount: attachments.length,
  }
}