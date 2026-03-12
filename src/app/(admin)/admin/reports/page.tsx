import { getReports } from "@/src/lib/queries/get-reports"
import ReportsTable from "@/src/components/reports/ReportsTable"
import { requireBoard } from "@/src/lib/auth/require-board"

export default async function AdminReportsPage() {

  // proteger ruta
  await requireBoard()

  const reports = await getReports()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          All Match Reports
        </h1>

        <p className="text-sm text-muted-foreground">
          Review all submitted referee reports
        </p>
      </div>

      <ReportsTable reports={reports} />
    </div>
  )
}