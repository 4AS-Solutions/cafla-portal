import AdminReportsList from "@/src/components/admin/reports/AdminReportsList";
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { requireBoard } from "@/src/lib/auth/require-board"
import { getReports } from "@/src/lib/queries/get-reports";

export default async function AdminReportsPage() {

  await requireBoard();

  const reports = await getReports();
  

  return (
    <div className="space-y-6 px-6">
      <PortalPageHeader
        title="Reports Management"
        subtitle="Review and manage match reports submitted by referees."
      />


      <AdminReportsList reports={reports} />
    </div>
  )
}