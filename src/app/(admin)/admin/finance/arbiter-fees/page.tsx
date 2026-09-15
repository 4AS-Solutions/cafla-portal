import { requireBoard } from "@/src/lib/auth/require-board"
import { ArbiterFeeImportWorkflow } from "@/src/components/admin/finance/ArbiterFeeImportWorkflow"

export default async function ArbiterFeeImportPage() {
  await requireBoard()
  return <ArbiterFeeImportWorkflow />
}
