import { getReports } from "@/src/lib/queries/get-reports"
import ReportsTable from "@/src/components/reports/ReportsTable"

export default async function ReportsPage() {
  const reports = await getReports()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Match Reports
        </h1>

        <p className="text-sm text-muted-foreground">
          Submitted match reports
        </p>
      </div>

      <ReportsTable reports={reports} />
    </div>
  )
}