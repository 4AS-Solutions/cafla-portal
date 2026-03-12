import { AdminRankingTable } from "@/src/components/admin/AdminRankingTable"
import { getAdminRanking } from "@/src/lib/queries/admin-ranking"
import { requireBoard } from "@/src/lib/auth/require-board"

export default async function AdminRankingPage() {

  await requireBoard()

  const referees = await getAdminRanking()

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Referee Ranking
      </h1>

      <AdminRankingTable referees={referees ?? []} />

    </div>
  )
}