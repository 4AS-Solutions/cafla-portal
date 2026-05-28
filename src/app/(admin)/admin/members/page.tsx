import { getMembers } from "@/src/lib/queries/get-members"

import MembersTable from "@/src/components/members/MembersTable"
import InviteMemberDialog from "@/src/components/members/InviteMemberDialog"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

import Pagination from "@/src/components/shared/pagination/Pagination"
import QueryFilters from "@/src/components/shared/filters/QueryFilter"
import { requireBoard } from "@/src/lib/auth/require-board"


export default async function MembersPage({
  searchParams
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    role?: string
    page?: string
  }>
}) {

  await requireBoard()

  const params = await searchParams

  // 🔥 PAGINATION
  const page = Number(params.page ?? 0)

  const limit = 10

  // 🔥 DATA
  const {
    data: members,
    count,
  } = await getMembers({
    search: params.search,
    status: params.status,
    role: params.role,
    page,
    limit,
  })

  return (

    <div className="space-y-6 px-6">

      {/* HEADER */}
      <PortalPageHeader
        title="Members"
        subtitle="Directory of referees and board members"
      />

      {/* ACTION */}
      <InviteMemberDialog />

      {/* FILTERS */}
      <QueryFilters
        filters={[
          {
            type: "search",
            key: "search",
            placeholder: "Search member...",
          },

          {
            type: "select",
            key: "status",
            placeholder: "Status",
            options: [
              {
                label: "Active",
                value: "active",
              },
              {
                label: "Invited",
                value: "invited",
              },
              {
                label: "Inactive",
                value: "inactive",
              },
            ],
          },

          {
            type: "select",
            key: "role",
            placeholder: "Role",
            options: [
              {
                label: "Member",
                value: "member",
              },
              {
                label: "Board",
                value: "board",
              },
            ],
          },
        ]}
      />

      {/* TABLE */}
      <MembersTable members={members} />

      {/* PAGINATION */}
      <Pagination
        currentPage={page}
        totalItems={count}
        itemsPerPage={limit}
        basePath="/admin/members"
      />

    </div>
  )
}