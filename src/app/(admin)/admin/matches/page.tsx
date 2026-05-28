import MatchesList from "@/src/components/admin/MatchesList"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { requireBoard } from "@/src/lib/auth/require-board"

export default async function MatchesPage() {

    await requireBoard()

  return (
    <div className="space-y-6 px-6">
    
          <PortalPageHeader
            title="Matches Management"
            subtitle="Browse and manage all matches in the CAFLA system."
          />

    
          <MatchesList />
    
        </div>
  )
}