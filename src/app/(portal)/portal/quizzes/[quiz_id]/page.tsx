import { redirect } from "next/navigation"

import { requireUser } from "@/src/lib/auth/require-user"
import { getQuizAttempt } from "@/src/lib/queries/get-quiz-attempt"

import QuizAttemptLauncher from "@/src/components/quizzes/QuizAttemptLauncher"
import QuizRunner from "@/src/components/quizzes/QuizRunner"

type QuizLanguage = "es" | "en"

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{
    quiz_id: string
  }>

  searchParams: Promise<{
    language?: string
    attempt?: string
  }>
}) {
  const user = await requireUser()

  const { quiz_id } = await params
  const query = await searchParams

  const attemptId = query.attempt

  const language =
    query.language === "en"
      ? "en"
      : query.language === "es"
        ? "es"
        : null

  /*
   * Si ya tenemos attempt, cargamos el snapshot.
   */
  if (attemptId) {
    const details =
      await getQuizAttempt({
        attemptId,
        memberId: user.id,
      })

    if (!details) {
      return (
        <div className="mx-auto max-w-xl rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-6 text-center">
          <p className="font-semibold text-red-200">
            Quiz attempt not found
          </p>

          <p className="mt-2 text-sm text-red-200/70">
            This attempt does not exist or does not belong to your account.
          </p>
        </div>
      )
    }

    /*
     * Evitar que alguien cambie el assessment ID
     * manualmente en la URL.
     */
    if (
      details.attempt.assessmentId !==
      quiz_id
    ) {
      redirect("/portal/quizzes")
    }

    /*
     * El QuizRunner anterior todavía no acepta
     * esta estructura. En el siguiente paso
     * lo reemplazaremos.
     */
    return (
      <QuizRunner
        attempt={details.attempt}
        assessment={details.assessment}
        version={details.version}
        questions={details.questions}
      />
    )
  }

  /*
   * Sin attempt, debe venir un idioma válido.
   */
  if (!language) {
    redirect("/portal/quizzes")
  }

  return (
    <QuizAttemptLauncher
      assessmentId={quiz_id}
      language={
        language as QuizLanguage
      }
    />
  )
}