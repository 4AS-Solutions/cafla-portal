export function getMatchStatus(match: any) {

  const now = new Date()

  const kickoff = new Date(match.kickoff_at)

  /*
  -----------------------------------
  FUTURE MATCH
  -----------------------------------
  */

  if (kickoff > now) {
    return "upcoming"
  }

  /*
  -----------------------------------
  NO REPORT SUBMITTED
  -----------------------------------
  */

  if (!match.report_status) {
    return "pending_report"
  }

  /*
  -----------------------------------
  REPORT WORKFLOW
  -----------------------------------
  */

  switch (match.report_status) {

    case "pending":
      return "submitted"

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