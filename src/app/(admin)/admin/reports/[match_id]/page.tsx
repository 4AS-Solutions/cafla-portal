import AdminReportDetail from "@/src/components/admin/reports/AdminReportDetail"
import { requireBoard } from "@/src/lib/auth/require-board"
import { getCardReasons } from "@/src/lib/queries/get-card-reasons"
import { getReportDetails } from "@/src/lib/queries/get-report-details"


export default async function Page({
  params,
}: {
  params: Promise<{ match_id: string }>
}) {

  await requireBoard()

  const { match_id } = await params

  const data = await getReportDetails(match_id)

  const cardReasons = await getCardReasons();

  return (
    <div className="w-full max-w[1400px]- mx-auto px-4 sm:px-6 lg:px-8">
      <AdminReportDetail {...data} cardReasons={cardReasons} />
    </div>
  )
}
