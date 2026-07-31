import "server-only"

import { resend } from "@/src/lib/resend"

import type {
    ReportApprovedEmailData,
    ReportAttachment,
} from "../types/report-approved.types"
import { ReportApprovedEmail } from "../templates/ReportApproved"

type SendReportApprovedEmailInput =
    ReportApprovedEmailData & {
        to: string | string[]
        subject?: string
    }

export type SendReportApprovedEmailResult = {
    emailId: string
}

function normalizeRecipients(
    recipients: string | string[]
): string[] {
    const values = Array.isArray(recipients)
        ? recipients
        : [recipients]

    return values
        .map((recipient) => recipient.trim())
        .filter((recipient) => recipient.length > 0)
}

function buildSubject(
    data: ReportApprovedEmailData
): string {
    const { report } = data

    return [
        "Official Match Report",
        `${report.homeTeamName} vs. ${report.awayTeamName}`,
        report.matchDate,
    ].join(" | ")
}

export async function sendReportApprovedEmail({
    to,
    subject,
    report,
    attachments,
}: SendReportApprovedEmailInput): Promise<SendReportApprovedEmailResult> {
    const recipients = normalizeRecipients(to)

    if (recipients.length === 0) {
        throw new Error(
            "At least one recipient is required."
        )
    }

    const resendAttachments = attachments
        .filter(
            (
                attachment
            ): attachment is ReportAttachment & {
                content: Buffer
            } => attachment.content instanceof Buffer
        )
        .map((attachment) => ({
            filename: attachment.filename,
            content: attachment.content,
        }))

const { data, error } =
    await resend.emails.send({
        from: "CAFLA <onboarding@cafla.org>",
        to: recipients,
        subject:
            subject ??
            buildSubject({
                report,
                attachments,
            }),

        react: (
            <ReportApprovedEmail
                report={report}
                attachments={attachments}
            />
        ),

        attachments: resendAttachments,
    })

    if (error) {
        console.error(
            "Approved report email error:",
            error
        )

        throw new Error(
            `Failed to send report email: ${error.message}`
        )
    }

    if (!data?.id) {
        throw new Error(
            "Resend did not return an email ID."
        )
    }

    return {
        emailId: data.id,
    }
}