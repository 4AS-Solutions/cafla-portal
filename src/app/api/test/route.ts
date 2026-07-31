import { NextResponse } from "next/server"

import { mapReportToEmail } from "@/src/emails/mappers/map-report-to-email"
import { sendReportApprovedEmail } from "@/src/emails/services/send-report-approved-email"
import { getCardReasons } from "@/src/lib/queries/get-card-reasons"
import { getReportDetails } from "@/src/lib/queries/get-report-details"
import { getReportAttachments } from "@/src/emails/services/get-report-attachments"

export const dynamic = "force-dynamic"

type TestReportEmailRequest = {
    matchId?: string
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

export async function POST(request: Request) {
    try {
        /*
         * Protect this development-only endpoint.
         */
        const expectedSecret =
            getRequiredEnvironmentVariable(
                "TEST_REPORT_EMAIL_SECRET"
            )

        const receivedSecret =
            request.headers
                .get("x-test-email-secret")
                ?.trim()

        if (
            !receivedSecret ||
            receivedSecret !== expectedSecret
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized.",
                },
                {
                    status: 401,
                }
            )
        }

        /*
         * Read the match ID from the request body.
         */
        let body: TestReportEmailRequest

        try {
            body =
                (await request.json()) as TestReportEmailRequest
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

        const matchId = body.matchId?.trim()

        if (!matchId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "matchId is required.",
                },
                {
                    status: 400,
                }
            )
        }

        /*
         * Load the same report data displayed to the Board.
         */
        const details =
            await getReportDetails(matchId)

        if (!details.match) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Match not found.",
                },
                {
                    status: 404,
                }
            )
        }

        if (!details.report) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "This match does not have a report.",
                },
                {
                    status: 404,
                }
            )
        }

        const cardReasons = await getCardReasons()

        const availableRosterAssets = details.assets.filter((asset: any) =>
                    [
                        "roster_combined",
                        "roster_home",
                        "roster_away",
                    ].includes(asset.asset_type) &&
                    typeof asset.storage_path === "string" &&
                    asset.storage_path.length > 0
            )
            .map((asset: any) => ({
                assetType: asset.asset_type,
                storagePath: asset.storage_path,
            }))

        /*
         * Transform the database response into the
         * official email structure.
         */
        const emailData = mapReportToEmail({
            match: details.match,
            report: details.report,
            goals: details.goals,
            cards: details.cards,
            center: details.center,
            ar1: details.ar1,
            ar2: details.ar2,
            comments: details.comments,
            rosterAttachments: availableRosterAssets,
            cardReasons,
        })

        const attachments = await getReportAttachments({
                rosterAttachments:
                    availableRosterAssets,

                homeTeamName:
                    emailData.report.homeTeamName,

                awayTeamName:
                    emailData.report.awayTeamName,
            })

            console.log("Email attachments prepared:", {
                availableAssets:
                    availableRosterAssets.length,
                downloadedAttachments:
                    attachments.length,
                filenames:
                    attachments.map(
                        (attachment) =>
                            attachment.filename
                    ),
            })

        const recipient =
            getRequiredEnvironmentVariable(
                "TEST_REPORT_EMAIL_TO"
            )

        /*
         * Send the email using real match data.
         */
        const result =
            await sendReportApprovedEmail({
                to: recipient,
                report: emailData.report,
                attachments
            })

        return NextResponse.json({
            success: true,
            message:
                "Test report email sent successfully.",
            matchId,
            reportId: details.report.id,
            recipient,
            emailId: result.emailId,
        })
    } catch (error) {
        console.error(
            "Test report email error:",
            error
        )

        const message =
            error instanceof Error
                ? error.message
                : "Unknown error."

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