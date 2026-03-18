import { createClient } from "@/src/lib/supabase/server"
import { getMatchDetails } from "./get-match-details"

export async function getReportDetails(reportId: string) {

  const supabase = await createClient()

  // 1️⃣ Get report
  const { data: report, error } = await supabase
    .from("match_reports")
    .select("id, match_id, status")
    .eq("id", reportId)
    .single()

  if (error || !report) {
    console.error("Report query error:", error)
    throw error
  }

  // 2️⃣ Reusar tu lógica existente 🔥
  const details = await getMatchDetails(report.match_id)

  return {
    ...details,
    report: {
      ...details.report,
      status: report.status, // asegurar status correcto
      id: report.id, // importante para actions
    },
  }
}