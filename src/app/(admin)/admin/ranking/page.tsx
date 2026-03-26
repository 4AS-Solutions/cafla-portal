import { AdminRankingTable } from "@/src/components/admin/AdminRankingTable"
import { getAdminRanking } from "@/src/lib/queries/admin-ranking"
import { requireBoard } from "@/src/lib/auth/require-board"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function AdminRankingPage() {
  await requireBoard()

  const referees = await getAdminRanking()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-yellow-400">
          Board Tools
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <PortalPageHeader
            title="Referee Ranking"
            subtitle="Monitor referee performance, identify risks, and support board decision-making."
          />
        </div>
      </div>

      <AdminRankingTable referees={referees ?? []} />
    </div>
  )
}