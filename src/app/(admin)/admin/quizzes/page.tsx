import { requireBoard } from "@/src/lib/auth/require-board"
import CreateQuizForm from "@/src/components/admin/quizzes/CreateQuizForm"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import QuizList from "@/src/components/quizzes/QuizList"
import { getAdminQuizzes } from "@/src/lib/queries/get-quizzes-admin"

export default async function AdminQuizzesPage() {

  await requireBoard()

  const quizzes = await getAdminQuizzes();

  return (

    <div className="space-y-6 px-6">

      <PortalPageHeader 
        title="Quizzes"
        subtitle="Create, manage and evaluate referees knowledge."
      />

      <CreateQuizForm />

      <QuizList quizzes={quizzes} />

    </div>

  )
}