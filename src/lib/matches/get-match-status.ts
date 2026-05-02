export function getMatchStatus(match: any) {

  const now = new Date()
  const kickoff = new Date(match.kickoff_at)

  const report = match.match_reports?.[0] ?? null
  const reportStatus = report?.status ?? null

  // 🟢 FUTURE
  if (kickoff > now) {
    return "upcoming"
  }

  // 🔴 PLAYED BUT NO REPORT
  if (!report) {
    return "pending_report"
  }

  // 🟡 BASED ON REPORT STATUS
  switch (reportStatus) {
    case "pending":
      return "pending_report"

    case "submitted":
      return "submitted"

    case "approved":
      return "approved"

    case "revision_required":
      return "revision_required"

    default:
      return "pending_report"
  }
}