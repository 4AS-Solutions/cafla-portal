import AdminReportDetail from "@/src/components/admin/reports/AdminReportDetail"
import { requireBoard } from "@/src/lib/auth/require-board"
import { getReportDetails } from "@/src/lib/queries/get-report-details"


export default async function Page({
  params,
}: {
  params: Promise<{ match_id: string }>
}) {

  await requireBoard()

  const { match_id } = await params

  const data = await getReportDetails(match_id)

  return (
    <div className="max-w-5xl mx-auto">
      <AdminReportDetail {...data} />
    </div>
  )
}
