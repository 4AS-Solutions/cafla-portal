import type { CSSProperties } from "react"
import { ReportApprovedEmailData, ReportGoal, ReportRedCard, ReportYellowCard } from "../types/report-approved.types"
import { buildRedCardStatement } from "../utils/build-red-card-statement"
import { CaflaEmailLayout } from "../components/CaflaEmailLayout"
import { EmailSection } from "../components/EmailSection"
import { EmailDataGrid } from "../components/EmailDataGrid"
import { EmailField } from "../components/EmailField"



const headingStyle: CSSProperties = {
    margin: "0 0 8px",
    fontSize: "26px",
    fontWeight: 800,
    lineHeight: "34px",
    color: "#f8fafc",
    textAlign: "center",
}

const introductionStyle: CSSProperties = {
    margin: "0 0 32px",
    fontSize: "14px",
    lineHeight: "22px",
    color: "#94a3b8",
    textAlign: "center",
}

const scoreContainerStyle: CSSProperties = {
    padding: "24px 16px",
    border: "1px solid rgba(52, 211, 153, 0.18)",
    borderRadius: "12px",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    textAlign: "center",
}

const scoreTeamsStyle: CSSProperties = {
    margin: 0,
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "21px",
    color: "#cbd5e1",
}

const scoreStyle: CSSProperties = {
    margin: "8px 0",
    fontSize: "34px",
    fontWeight: 800,
    lineHeight: "40px",
    color: "#f8fafc",
}

const emptyTextStyle: CSSProperties = {
    margin: 0,
    fontSize: "14px",
    lineHeight: "22px",
    color: "#64748b",
    fontStyle: "italic",
}

const eventRowStyle: CSSProperties = {
    padding: "12px 0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
}

const eventTitleStyle: CSSProperties = {
    margin: 0,
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "21px",
    color: "#e2e8f0",
}

const eventMetadataStyle: CSSProperties = {
    margin: "3px 0 0",
    fontSize: "13px",
    lineHeight: "20px",
    color: "#94a3b8",
}

const redCardContainerStyle: CSSProperties = {
    marginBottom: "20px",
    padding: "18px",
    border: "1px solid rgba(220, 38, 38, 0.25)",
    borderRadius: "10px",
    backgroundColor: "rgba(127, 29, 29, 0.10)",
}

const redCardLabelStyle: CSSProperties = {
    margin: "0 0 5px",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: "16px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#f87171",
}

const redCardStatementStyle: CSSProperties = {
    margin: 0,
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "22px",
    color: "#f1f5f9",
}

const refereeStatementStyle: CSSProperties = {
    margin: "8px 0 0",
    paddingLeft: "12px",
    borderLeft: "2px solid rgba(248, 113, 113, 0.55)",
    fontSize: "14px",
    lineHeight: "22px",
    whiteSpace: "pre-wrap",
    color: "#cbd5e1",
}

const commentsStyle: CSSProperties = {
    margin: 0,
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    fontSize: "14px",
    lineHeight: "23px",
    whiteSpace: "pre-wrap",
    color: "#cbd5e1",
}

const attachmentRowStyle: CSSProperties = {
    margin: "0 0 8px",
    fontSize: "14px",
    lineHeight: "21px",
    color: "#cbd5e1",
}

function GoalRow({ goal }: { goal: ReportGoal }) {
    return (
        <div style={eventRowStyle}>
            <p style={eventTitleStyle}>
                {goal.minute}&apos; — {goal.playerName}
                {goal.playerNumber ? ` (#${goal.playerNumber})` : ""}
            </p>

            <p style={eventMetadataStyle}>{goal.teamName}</p>
        </div>
    )
}

function YellowCardRow({
    yellowCard,
}: {
    yellowCard: ReportYellowCard
}) {
    return (
        <div style={eventRowStyle}>
            <p style={eventTitleStyle}>
                {yellowCard.minute}&apos; — {yellowCard.playerName}
                {yellowCard.playerNumber
                    ? ` (#${yellowCard.playerNumber})`
                    : ""}
            </p>

            <p style={eventMetadataStyle}>
                {yellowCard.teamName}
                {yellowCard.reasonLabel
                    ? ` — ${yellowCard.reasonLabel}`
                    : ""}
            </p>
        </div>
    )
}

function RedCardReport({
    redCard,
    index,
}: {
    redCard: ReportRedCard
    index: number
}) {
    const standardStatement = buildRedCardStatement(redCard)

    return (
        <div style={redCardContainerStyle}>
            <p style={redCardLabelStyle}>
                Red Card Report {index + 1}
            </p>

            <p style={redCardStatementStyle}>
                {standardStatement}
            </p>

            <p
                style={{
                    ...redCardLabelStyle,
                    marginTop: "18px",
                }}
            >
                Referee Statement
            </p>

            <p style={refereeStatementStyle}>
                {redCard.refereeStatement}
            </p>
        </div>
    )
}

export function ReportApprovedEmail({
    report,
    attachments,
}: ReportApprovedEmailData) {
    const previewText = `Official match report: ${report.homeTeamName} vs. ${report.awayTeamName}`

    return (
        <CaflaEmailLayout previewText={previewText}>
            <h1 style={headingStyle}>Official Match Report</h1>

            <p style={introductionStyle}>
                The following match report has been reviewed and
                approved by CAFLA.
            </p>

            <EmailSection title="Match Information">
                <EmailDataGrid>
                    <EmailField
                        label="League"
                        value={report.leagueName}
                    />

                    <EmailField
                        label="Division"
                        value={report.divisionName}
                    />

                    <EmailField
                        label="Match Date"
                        value={report.matchDate}
                    />

                    <EmailField
                        label="Kickoff"
                        value={report.kickoffTime}
                    />

                    <EmailField
                        label="Venue"
                        value={report.venue}
                    />

                    <EmailField
                        label="Field"
                        value={report.field}
                    />

                    <EmailField
                        label="Match Number"
                        value={report.matchNumber}
                    />
                </EmailDataGrid>
            </EmailSection>

            <EmailSection title="Final Score">
                <div style={scoreContainerStyle}>
                    <p style={scoreTeamsStyle}>
                        {report.homeTeamName}
                    </p>

                    <p style={scoreStyle}>
                        {report.homeScore} – {report.awayScore}
                    </p>

                    <p style={scoreTeamsStyle}>
                        {report.awayTeamName}
                    </p>
                </div>
            </EmailSection>

            <EmailSection title="Match Officials">
                <EmailDataGrid>
                    <EmailField
                        label="Referee"
                        value={report.refereeName}
                    />

                    <EmailField
                        label="Assistant Referee 1"
                        value={report.assistantReferee1Name}
                    />

                    <EmailField
                        label="Assistant Referee 2"
                        value={report.assistantReferee2Name}
                    />

                    {report.fourthOfficialName ? (
                        <EmailField
                            label="Fourth Official"
                            value={report.fourthOfficialName}
                        />
                    ) : null}
                </EmailDataGrid>
            </EmailSection>

            <EmailSection title="Goals">
                {report.goals.length > 0 ? (
                    report.goals.map((goal: ReportGoal, index: number) => (
                        <GoalRow
                            key={`${goal.teamName}-${goal.playerName}-${goal.minute}-${index}`}
                            goal={goal}
                        />
                    ))
                ) : (
                    <p style={emptyTextStyle}>
                        No goals were reported.
                    </p>
                )}
            </EmailSection>

            <EmailSection title="Cautions">
                {report.yellowCards.length > 0 ? (
                    report.yellowCards.map(
                        (yellowCard: ReportYellowCard, index: number) => (
                            <YellowCardRow
                                key={`${yellowCard.teamName}-${yellowCard.playerName}-${yellowCard.minute}-${index}`}
                                yellowCard={yellowCard}
                            />
                        )
                    )
                ) : (
                    <p style={emptyTextStyle}>
                        No cautions were reported.
                    </p>
                )}
            </EmailSection>

            {report.redCards.length > 0 ? (
                <EmailSection title="Red Card Reports">
                    {report.redCards.map((redCard: ReportRedCard, index: number) => (
                        <RedCardReport
                            key={`${redCard.teamName}-${redCard.playerName}-${redCard.minute}-${index}`}
                            redCard={redCard}
                            index={index}
                        />
                    ))}
                </EmailSection>
            ) : null}

            <EmailSection title="General Referee Comments">
                {report.generalRefereeComments ? (
                    <p style={commentsStyle}>
                        {report.generalRefereeComments}
                    </p>
                ) : (
                    <p style={emptyTextStyle}>
                        No additional incidents or comments were
                        reported.
                    </p>
                )}
            </EmailSection>

            <EmailSection title="Attached Match Documents">
                {attachments.length > 0 ? (
                    attachments.map((attachment) => (
                        <p
                            key={attachment.filename}
                            style={attachmentRowStyle}
                        >
                            • {attachment.filename}
                        </p>
                    ))
                ) : (
                    <p style={emptyTextStyle}>
                        No documents are attached.
                    </p>
                )}
            </EmailSection>

            <p
                style={{
                    margin: "8px 0 0",
                    fontSize: "12px",
                    lineHeight: "19px",
                    color: "#64748b",
                    textAlign: "center",
                }}
            >
                This email was generated automatically after the
                match report was approved by CAFLA.
            </p>
        </CaflaEmailLayout>
    )
}