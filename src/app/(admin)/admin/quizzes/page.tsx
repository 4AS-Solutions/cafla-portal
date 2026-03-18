import { requireBoard } from "@/src/lib/auth/require-board"
import CreateQuizForm from "@/src/components/admin/CreateQuizForm"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

export default async function AdminQuizzesPage() {

  await requireBoard()

  return (

    <div className="space-y-6 px-6">

      <PortalPageHeader 
        title="Quizzes"
        subtitle="Manage and create quizzes for your board members."
      />

      <CreateQuizForm />

    </div>

  )
}