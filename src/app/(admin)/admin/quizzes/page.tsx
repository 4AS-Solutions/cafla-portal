import { requireBoard } from "@/src/lib/auth/require-board"
import CreateQuizForm from "@/src/components/admin/CreateQuizForm"

export default async function AdminQuizzesPage() {

  await requireBoard()

  return (

    <div className="max-w-3xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        Create Quiz
      </h1>

      <CreateQuizForm />

    </div>

  )
}