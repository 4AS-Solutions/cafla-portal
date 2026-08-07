import { notFound } from "next/navigation"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getAdminQuizQuestionBank } from "@/src/lib/queries/get-admin-quiz-question-bank"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import QuestionGroupEditor from "@/src/components/admin/quizzes/QuestionGroupEditor"

type PageProps = {
  params: Promise<{
    assessment_id: string
    question_group_id: string
  }>
}

export default async function EditQuestionGroupPage({
  params,
}: PageProps) {
  await requireBoard()

  const {
    assessment_id,
    question_group_id,
  } = await params

  const bank =
    await getAdminQuizQuestionBank(
      assessment_id
    )

  if (!bank) {
    notFound()
  }

  const group =
    bank.groups.find(
      (item) =>
        item.id ===
        question_group_id
    )

  if (!group) {
    notFound()
  }

  /*
   * Even though the API will also
   * enforce this rule, the page itself
   * should not expose an editor once
   * academic content has been locked.
   */
  if (
    bank.assessment.contentLocked ||
    bank.assessment.status ===
      "closed" ||
    bank.assessment.status ===
      "archived"
  ) {
    notFound()
  }

  return (
    <div className="space-y-6 pb-12">
      <PortalPageHeader
        title="Edit Question"
        subtitle={bank.assessment.title}
      />

      <QuestionGroupEditor
        assessmentId={
          bank.assessment.id
        }
        assessmentTitle={
          bank.assessment.title
        }
        versions={
          bank.versions
        }
        initialGroup={group}
      />
    </div>
  )
}