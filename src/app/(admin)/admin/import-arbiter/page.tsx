import { requireBoard } from "@/src/lib/auth/require-board"
import ImportArbiterForm from "@/src/components/admin/ImportArbiterForm"

export default async function page() {
  await requireBoard()

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Import Arbiter Matches</h1>
      <ImportArbiterForm />
    </div>
  )
}