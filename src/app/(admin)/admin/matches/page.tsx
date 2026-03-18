import MatchesList from "@/src/components/admin/MatchesList"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default function MatchesPage() {
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