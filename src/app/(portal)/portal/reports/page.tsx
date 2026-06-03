import { getReports } from "@/src/lib/queries/get-reports"

import ReportsList from "@/src/components/reports/ReportsList"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

import Pagination from "@/src/components/shared/pagination/Pagination"
import { requireUser } from "@/src/lib/auth/require-user"
import QueryFilters from "@/src/components/shared/filters/QueryFilter"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
  }>
}) {

  await requireUser();

  const params = await searchParams

  // 🔥 PAGINATION
  const page = Number(params.page ?? 0)

  const limit = 6

  const search = params.search;
  const status = params.status;

  // 🔥 DATA
  const {
    data: reports,
    count,
  } = await getReports({
    page,
    limit,

    search,
    status
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

      <QueryFilters
        filters={[
          {
            type: "search",
            key: "search",
            placeholder: "Search reports...",
          },
          {
            type: "select",
            key: "status",
            placeholder: "Status",
            options: [
              {
                label: "Pending",
                value: "pending",
              },
              {
                label: "Revision Required",
                value: "revision_required",
              },
              {
                label: "Submitted",
                value: "submitted",
              },
              {
                label: "Approved",
                value: "approved",
              },
            ],
          },
        ]}
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