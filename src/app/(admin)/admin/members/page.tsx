import { getMembers } from "@/src/lib/queries/get-members"
import MembersTable from "@/src/components/members/MembersTable"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import MembersFilters from "@/src/components/members/MembersFilters"

export default async function MembersPage({
  searchParams,
}: {
  searchParams: {
    search?: string
    status?: string
    role?: string
  }
}) {
  const members = await getMembers({
    search: searchParams.search,
    status: searchParams.status,
    role: searchParams.role,
  })

  return (
    <div className="space-y-6 px-6">

      <PortalPageHeader
        title="Members"
        subtitle="Directory of referees and board members"
      />

      <MembersFilters />

      <MembersTable members={members} />

    </div>
  )
}