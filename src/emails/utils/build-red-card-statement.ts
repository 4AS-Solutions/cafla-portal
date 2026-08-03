import type { ReportRedCard } from "../types/report-approved.types"

type RedCardStatementInput = Pick<
    ReportRedCard,
    | "playerName"
    | "playerNumber"
    | "teamName"
    | "minute"
    | "reasonLabel"
>

function formatOrdinal(value: number): string {
    const lastTwoDigits = value % 100

    if (
        lastTwoDigits === 11 ||
        lastTwoDigits === 12 ||
        lastTwoDigits === 13
    ) {
        return `${value}th`
    }

    switch (value % 10) {
        case 1:
            return `${value}st`

        case 2:
            return `${value}nd`

        case 3:
            return `${value}rd`

        default:
            return `${value}th`
    }
}

export function buildRedCardStatement({
    playerName,
    playerNumber,
    teamName,
    minute,
    reasonLabel,
}: RedCardStatementInput): string {
    const normalizedPlayerName = playerName.trim()
    const normalizedPlayerNumber = playerNumber.trim()
    const normalizedTeamName = teamName.trim()
    const normalizedReasonLabel = reasonLabel.trim()

    if (!normalizedPlayerName) {
        throw new Error("Red card player name is required.")
    }

    if (!normalizedPlayerNumber) {
        throw new Error("Red card player number is required.")
    }

    if (!normalizedTeamName) {
        throw new Error("Red card team name is required.")
    }

    if (!Number.isInteger(minute) || minute < 1 || minute > 90) {
        throw new Error(
            "Red card minute must be an integer between 1 and 90."
        )
    }

    if (!normalizedReasonLabel) {
        throw new Error("Red card reason is required.")
    }

    const formattedMinute = formatOrdinal(minute)

    return `${normalizedPlayerName} (#${normalizedPlayerNumber}) of ${normalizedTeamName} was shown a red card in the ${formattedMinute} minute for ${normalizedReasonLabel}.`
}