export type ReportGoal = {
    minute: number
    teamName: string
    playerName: string
    playerNumber?: string
}

export type ReportYellowCard = {
    minute: number
    teamName: string
    playerName: string
    playerNumber?: string
    reasonLabel?: string
}

export type ReportRedCard = {
    minute: number
    teamName: string
    playerName: string
    playerNumber: string
    reasonLabel: string

    /**
     * Narrative written by the referee explaining
     * the specific circumstances of this dismissal.
     */
    refereeStatement: string
}

export type ReportOfficial = {
    leagueName: string
    divisionName?: string

    matchDate: string
    kickoffTime: string

    venue: string
    field?: string
    matchNumber?: string

    homeTeamName: string
    awayTeamName: string

    homeScore: number
    awayScore: number

    refereeName: string
    assistantReferee1Name?: string
    assistantReferee2Name?: string
    fourthOfficialName?: string

    goals: ReportGoal[]
    yellowCards: ReportYellowCard[]
    redCards: ReportRedCard[]

    /**
     * General match incidents that are not the explanation
     * of an individual red card.
     *
     * Examples:
     * injuries, spectators, delays, field conditions
     * and other general incidents.
     */
    generalRefereeComments?: string
}

export type ReportAttachment = {
    filename: string
    content?: Buffer
}

export type ReportApprovedEmailData = {
    report: ReportOfficial
    attachments: ReportAttachment[]
}