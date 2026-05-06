export default function MatchStatusBadge({
  status,
}: {
  status: string
}) {
  console.log("MatchStatusBadge status:", status)

  /*
  -----------------------------
  REPORT SUBMITTED
  -----------------------------
  */

  if (status === "submitted") {

    return (

      <span className="text-emerald-400 text-sm font-semibold">
        Report Submitted
      </span>

    )

  }

  /*
  -----------------------------
  REPORT APPROVED
  -----------------------------
  */

  if (status === "approved") {

    return (

      <span className="text-green-500 text-sm font-semibold">
        Report Approved
      </span>

    )

  }

  /*
  -----------------------------
  REVISION REQUIRED
  -----------------------------
  */

  if (status === "revision_required") {

    return (

      <span className="text-orange-400 text-sm font-semibold">
        Revision Required
      </span>

    )

  }

  /*
  -----------------------------
  REPORT PENDING
  -----------------------------
  */

  if (status === "pending_report") {

    return (

      <span className="text-yellow-400 text-sm font-semibold">
        Report Pending
      </span>

    )

  }

  /*
  -----------------------------
  UPCOMING
  -----------------------------
  */

  return (

    <span className="text-blue-400 text-sm font-semibold">
      Upcoming
    </span>

  )

}