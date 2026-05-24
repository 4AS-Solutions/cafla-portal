
import { getUserMatches } from "@/src/lib/matches/get-user-matches"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import MatchSummaryBar from "@/src/components/match/MatchSummaryBar"
import MatchList from "@/src/components/match/MatchList"

import Pagination from "@/src/components/shared/pagination/Pagination"
import QueryFilters from "@/src/components/shared/filters/QueryFilter"
import { requireUser } from "@/src/lib/auth/require-user"


export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string

    search?: string

    matchStatus?: string

    reportStatus?: string

    date?: string
  }>
}) {

  const params = await searchParams

  const user = await requireUser();

  // =====================================================
  // 🔥 PAGINATION
  // =====================================================

  const page =
    Number(params.page ?? 0)

  const limit = 6

  // =====================================================
  // 🔥 DATA
  // =====================================================

  const {
    data: matches,
    count,
  } = await getUserMatches({

    userId: user.id,

    page,
    limit,

    search: params.search,

    matchStatus:
      params.matchStatus,

    reportStatus:
      params.reportStatus,

    date: params.date,
  })

  const now = new Date()

  // =====================================================
  // 🔥 SUMMARY
  // =====================================================

  const upcomingCount = matches.filter(
    (match) => {

      const kickoff = new Date(
        match.kickoff_at
      )

      return kickoff > now
    }
  ).length

  const pendingReportsCount =
    matches.filter((match) => {

      const kickoff = new Date(
        match.kickoff_at
      )

      const isPlayed =
        kickoff <= now

      const isCenterRef =
        match.role === "CR"

      const isPending =
        !match.report_status ||
        match.report_status ===
          "pending"

      return (
        isPlayed &&
        isCenterRef &&
        isPending
      )
    }).length

  const submittedReportsCount =
    matches.filter((match) => {

      return (
        match.report_status ===
          "submitted" ||

        match.report_status ===
          "approved" ||

        match.report_status ===
          "revision_required"
      )
    }).length

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <PortalPageHeader
        title="My Matches"
        subtitle="View your assignments and submit match reports."
      />

      {/* SUMMARY */}
      <MatchSummaryBar
        upcomingCount={
          upcomingCount
        }
        pendingReportsCount={
          pendingReportsCount
        }
        submittedReportsCount={
          submittedReportsCount
        }
      />

      {/* FILTERS */}
      <QueryFilters
        filters={[
          {
            type: "search",
            key: "search",
            placeholder:
              "Search teams or league...",
          },

          {
            type: "select",
            key: "matchStatus",
            placeholder:
              "Match Status",
            options: [
              {
                label: "Upcoming",
                value: "upcoming",
              },
              {
                label: "Played",
                value: "played",
              },
            ],
          },

          {
            type: "select",
            key: "reportStatus",
            placeholder:
              "Report Status",
            options: [
              {
                label: "Pending",
                value: "pending",
              },
              {
                label:
                  "Revision Required",
                value:
                  "revision_required",
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

          {
            type: "date",
            key: "date",
          },
        ]}
      />

      {/* MATCHES */}
      <MatchList matches={matches} />

      {/* PAGINATION */}
      <Pagination
        currentPage={page}
        totalItems={count}
        itemsPerPage={limit}
        basePath="/portal/matches"
      />

    </div>
  )
}