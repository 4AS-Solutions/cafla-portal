import { getReports } from "@/src/lib/queries/get-reports"

import ReportsList from "@/src/components/reports/ReportsList"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

import Pagination from "@/src/components/shared/pagination/Pagination"
import { requireUser } from "@/src/lib/auth/require-user"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
  }>
}) {

  await requireUser();

  const params = await searchParams

  // 🔥 PAGINATION
  const page = Number(params.page ?? 0)

  const limit = 6

  // 🔥 DATA
  const {
    data: reports,
    count,
  } = await getReports({
    page,
    limit,
  })

  // 🔥 PENDING
  const pending = reports.filter(
    (r) =>
      r.status === "pending" ||
      r.status === "revision_required"
  )

  // 🔥 SUBMITTED
  const submitted = reports.filter(
    (r) =>
      r.status === "submitted" ||
      r.status === "approved"
  )

  return (

    <div className="space-y-8">

      {/* HEADER */}
      <PortalPageHeader
        title="Match Reports"
        subtitle="Manage and review your match reports"
      />

      {/* PENDING */}
      <ReportsList
        title="Pending Reports"
        reports={pending}
        type="pending"
      />

      {/* SUBMITTED */}
      <ReportsList
        title="Submitted Reports"
        reports={submitted}
        type="submitted"
      />

      {/* PAGINATION */}
      <Pagination
        currentPage={page}
        totalItems={count}
        itemsPerPage={limit}
        basePath="/portal/reports"
      />

    </div>
  )
}