export function getMatchStatus(match: any) {

  const now = new Date()
  const kickoff = new Date(match.kickoff_at)

  if (match.report_status === "submitted") {
    return "reported"
  }

  if (kickoff < now) {
    return "pending_report"
  }

  return "upcoming"
}