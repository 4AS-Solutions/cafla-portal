import ImportArbiterForm from "@/src/components/admin/ImportArbiterForm"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { requireBoard } from "@/src/lib/auth/require-board"

export default async function ImportArbiterPage() {

    await requireBoard()

  return (
    <div className="space-y-6">

      <PortalPageHeader
        title="Import Arbiter Matches"
        subtitle="Import match data for an arbiter from an external source. This will create matches and assign them to the selected arbiter."
      />

      <ImportArbiterForm />

    </div>
  )
}