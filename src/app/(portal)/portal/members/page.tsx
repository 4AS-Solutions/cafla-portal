import { getMembers } from "@/src/lib/queries/get-members"
import MembersTable from "@/src/components/members/MembersTable"

export default async function MembersPage() {

  const members = await getMembers()

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Members
        </h1>

        <p className="text-sm text-muted-foreground">
          Directory of referees and board members
        </p>
      </div>

      <MembersTable members={members} />

    </div>
  )
}