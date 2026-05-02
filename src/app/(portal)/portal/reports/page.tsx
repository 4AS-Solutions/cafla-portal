import { getReports } from "@/src/lib/queries/get-reports"
import ReportsList from "@/src/components/reports/ReportsList"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function ReportsPage() {

  const reports = await getReports()

  const pending = reports.filter(
    (r) =>
      r.status === "pending" ||
      r.status === "revision_required"
  )

  const submitted = reports.filter(
    (r) =>
      r.status === "submitted" ||
      r.status === "approved"
  )

  return (

    <div className="space-y-8">

      {/* Header */}

      <PortalPageHeader
        title="Match Reports"
        subtitle="Manage and review your match reports"
      />

      {/* Pending */}

      <ReportsList
        title="Pending Reports"
        reports={pending}
        type="pending"
      />


      {/* Submitted */}

      <ReportsList
        title="Submitted Reports"
        reports={submitted}
        type="submitted"
      />

    </div>

  )
}