import type {
  ReportApprovedEmailData,
  ReportAttachment,
  ReportGoal,
  ReportRedCard,
  ReportYellowCard,
} from "../types/report-approved.types"

type MatchData = {
  id: string
  arbiter_match_id?: string | null
  match_number?: string | null
  home_team: string
  away_team: string
  league?: string | null
  division?: string | null
  location?: string | null
  field?: string | null
  kickoff_at: string
}

type MatchReportData = {
  id: string
  match_id: string
  home_score: number
  away_score: number
  comments?: string | null
  status?: string | null
}

type GoalData = {
  id: string
  report_id: string
  team: string
  player_name: string
  player_number?: string | null
  minute: number
}

type CardData = {
  id: string
  report_id: string
  team: string
  card_type: string
  player_name: string
  player_number?: string | null
  minute: number
  reason_code?: string | null
  notes?: string | null
}

type OfficialData = {
  full_name?: string | null
} | null

type CardReasonData = {
  code?: string | null
  reason_code?: string | null
  label?: string | null
  name?: string | null
  description?: string | null
}

type RosterAttachmentData = {
  assetType:
    | "roster_combined"
    | "roster_home"
    | "roster_away"
  storagePath: string
}

export type MapReportToEmailInput = {
  match: MatchData
  report: MatchReportData
  goals: GoalData[]
  cards: CardData[]
  center: OfficialData
  ar1: OfficialData
  ar2: OfficialData
  comments?: string | null
  cardReasons?: CardReasonData[]
  rosterAttachments?: RosterAttachmentData[]
}

function getTeamName(
  team: string,
  match: MatchData
): string {
  const normalizedTeam = team.trim().toLowerCase()

  if (normalizedTeam === "home") {
    return match.home_team
  }

  if (normalizedTeam === "away") {
    return match.away_team
  }

  return team
}

function getReasonLabel(
  reasonCode: string | null | undefined,
  cardReasons: CardReasonData[]
): string {
  if (!reasonCode) {
    return "Reason not specified"
  }

  const normalizedCode = reasonCode.trim().toUpperCase()

  const reason = cardReasons.find((item) => {
    const code = item.code ?? item.reason_code

    return code?.trim().toUpperCase() === normalizedCode
  })

  return (
    reason?.label ??
    reason?.name ??
    reason?.description ??
    reasonCode
  )
}

function getAttachmentFilename(
  attachment: RosterAttachmentData,
  match: MatchData
): string {
  switch (attachment.assetType) {
    case "roster_home":
      return `${match.home_team} Roster.pdf`

    case "roster_away":
      return `${match.away_team} Roster.pdf`

    case "roster_combined":
      return `${match.home_team} vs ${match.away_team} Rosters.pdf`

    default:
      return "Match Roster.pdf"
  }
}

function formatMatchDate(kickoffAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(kickoffAt))
}

function formatKickoffTime(kickoffAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(kickoffAt))
}

export function mapReportToEmail({
  match,
  report,
  goals,
  cards,
  center,
  ar1,
  ar2,
  comments,
  cardReasons = [],
  rosterAttachments = [],
}: MapReportToEmailInput): ReportApprovedEmailData {
  if (!match) {
    throw new Error(
      "Match data is required to build the report email."
    )
  }

  if (!report) {
    throw new Error(
      "Report data is required to build the report email."
    )
  }

  const mappedGoals: ReportGoal[] = goals
    .map((goal) => ({
      minute: goal.minute,
      teamName: getTeamName(goal.team, match),
      playerName: goal.player_name,
      playerNumber:
        goal.player_number?.trim() || undefined,
    }))
    .sort((a, b) => a.minute - b.minute)

  const yellowCards: ReportYellowCard[] = cards
    .filter(
      (card) =>
        card.card_type.trim().toLowerCase() === "yellow"
    )
    .map((card) => ({
      minute: card.minute,
      teamName: getTeamName(card.team, match),
      playerName: card.player_name,
      playerNumber:
        card.player_number?.trim() || undefined,
      reasonLabel: getReasonLabel(
        card.reason_code,
        cardReasons
      ),
    }))
    .sort((a, b) => a.minute - b.minute)

  const redCards: ReportRedCard[] = cards
    .filter(
      (card) =>
        card.card_type.trim().toLowerCase() === "red"
    )
    .map((card) => ({
      minute: card.minute,
      teamName: getTeamName(card.team, match),
      playerName: card.player_name,

      // En ReportRedCard este campo es obligatorio.
      playerNumber:
        card.player_number?.trim() || "N/A",

      reasonLabel: getReasonLabel(
        card.reason_code,
        cardReasons
      ),

      refereeStatement:
        card.notes?.trim() ||
        "No referee statement was provided.",
    }))
    .sort((a, b) => a.minute - b.minute)

  const attachments: ReportAttachment[] =
    rosterAttachments.map((attachment) => ({
      filename: getAttachmentFilename(
        attachment,
        match
      ),
    }))

  return {
    report: {
      leagueName:
        match.league?.trim() || "Not provided",

      divisionName:
        match.division?.trim() || undefined,

      matchDate: formatMatchDate(match.kickoff_at),

      kickoffTime: formatKickoffTime(
        match.kickoff_at
      ),

      venue:
        match.location?.trim() || "Not provided",

      field: match.field?.trim() || undefined,

      matchNumber:
        match.match_number?.trim() ||
        match.arbiter_match_id?.trim() ||
        undefined,

      homeTeamName: match.home_team,
      awayTeamName: match.away_team,

      homeScore: report.home_score,
      awayScore: report.away_score,

      refereeName:
        center?.full_name?.trim() || "Not assigned",

      assistantReferee1Name:
        ar1?.full_name?.trim() || undefined,

      assistantReferee2Name:
        ar2?.full_name?.trim() || undefined,

      goals: mappedGoals,
      yellowCards,
      redCards,

      generalRefereeComments:
        comments?.trim() ||
        report.comments?.trim() ||
        undefined,
    },

    attachments,
  }
}