import { getMemberById } from "@/src/lib/queries/get-member-by-id"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import EditMemberForm from "@/src/components/members/EditMemberForm"

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ member_id: string }>
}) {
  const { member_id } = await params
  const member = await getMemberById(member_id)

  if (!member) {
    return <div>Member not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PortalPageHeader
        title="Edit Member"
        subtitle={`Managing ${member.full_name}`}
      />

      <EditMemberForm member={member} />
    </div>
  )
}