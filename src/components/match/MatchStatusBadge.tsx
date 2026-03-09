export default function MatchStatusBadge({ status }: { status: string }) {

  if (status === "reported") {
    return (
      <span className="text-green-600 text-sm font-medium">
        Report Submitted
      </span>
    )
  }

  if (status === "pending_report") {
    return (
      <span className="text-yellow-600 text-sm font-medium">
        Report Pending
      </span>
    )
  }

  return (
    <span className="text-blue-600 text-sm font-medium">
      Upcoming
    </span>
  )
}