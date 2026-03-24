import { getMembers } from "@/src/lib/queries/get-members"
import MembersTable from "@/src/components/members/MembersTable"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import MembersFilters from "@/src/components/members/MembersFilters"
import InviteMemberDialog from "@/src/components/members/InviteMemberDialog"

export default async function MembersPage({
  searchParams
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    role?: string
  }>
}) {

  const params = await searchParams

  const members = await getMembers({
    search: params.search,
    status: params.status,
    role: params.role,
  })

  return (
    <div className="space-y-6 px-6">

      <PortalPageHeader
        title="Members"
        subtitle="Directory of referees and board members"
      />

      <InviteMemberDialog />

      <MembersFilters />

      <MembersTable members={members} />

    </div>
  )
}