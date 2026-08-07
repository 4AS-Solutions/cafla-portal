import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type QuizLanguage = "es" | "en"

type AttemptRow = {
  id: string
  assessment_id: string
  version_id: string
  member_id: string
  attempt_number: number
  status:
    | "in_progress"
    | "submitted"
    | "expired"
    | "voided"
  started_at: string
  expires_at: string
  submitted_at: string | null
  score: number | string | null
  correct_count: number | null
  total_questions: number | null
}

type AttemptQuestionRow = {
  id: string
  display_position: number
  question_id: string
  option_order: string[]
}

type QuestionRow = {
  id: string
  question_text: string
}

type OptionRow = {
  id: string
  question_id: string
  option_text: string
}

type SavedAnswerRow = {
  attempt_question_id: string
  selected_option_id: string | null
}

export type QuizAttemptDetails = {
  attempt: {
    id: string
    assessmentId: string
    attemptNumber: number
    status: AttemptRow["status"]
    startedAt: string
    expiresAt: string
  }

  assessment: {
    id: string
    title: string
    timeLimitMinutes: number
    maxAttempts: number
  }

  version: {
    id: string
    language: QuizLanguage
    title: string
    instructions: string | null
  }

  questions: {
    attemptQuestionId: string
    position: number
    questionText: string
    selectedOptionId: string | null

    options: {
      id: string
      text: string
    }[]
  }[]
}

export async function getQuizAttempt({
  attemptId,
  memberId,
}: {
  attemptId: string
  memberId: string
}): Promise<QuizAttemptDetails | null> {
  const supabaseAdmin =
    getSupabaseAdmin()

  const {
    data: attemptData,
    error: attemptError,
  } = await supabaseAdmin
    .schema("development")
    .from("quiz_attempts")
    .select(`
      id,
      assessment_id,
      version_id,
      member_id,
      attempt_number,
      status,
      started_at,
      expires_at,
      submitted_at,
      score,
      correct_count,
      total_questions
    `)
    .eq("id", attemptId)
    .eq("member_id", memberId)
    .maybeSingle()

  if (attemptError) {
    console.error(
      "[QUIZZES] Unable to load attempt:",
      attemptError
    )

    throw new Error(
      "Unable to load the quiz attempt."
    )
  }

  if (!attemptData) {
    return null
  }

  const attempt =
    attemptData as AttemptRow

  const [
    assessmentResponse,
    versionResponse,
    snapshotResponse,
    answersResponse,
  ] = await Promise.all([
    supabaseAdmin
      .schema("development")
      .from("quiz_assessments")
      .select(`
        id,
        title,
        time_limit_minutes,
        max_attempts
      `)
      .eq("id", attempt.assessment_id)
      .single(),

    supabaseAdmin
      .schema("development")
      .from("quiz_versions")
      .select(`
        id,
        language,
        title,
        instructions
      `)
      .eq("id", attempt.version_id)
      .single(),

    supabaseAdmin
      .schema("development")
      .from("quiz_attempt_questions")
      .select(`
        id,
        display_position,
        question_id,
        option_order
      `)
      .eq("attempt_id", attempt.id)
      .order("display_position", {
        ascending: true,
      }),

    supabaseAdmin
      .schema("development")
      .from("quiz_answers")
      .select(`
        attempt_question_id,
        selected_option_id
      `)
      .eq("attempt_id", attempt.id),
  ])

  if (assessmentResponse.error) {
    throw new Error(
      "Unable to load the assessment."
    )
  }

  if (versionResponse.error) {
    throw new Error(
      "Unable to load the selected quiz language."
    )
  }

  if (snapshotResponse.error) {
    throw new Error(
      "Unable to load quiz questions."
    )
  }

  if (answersResponse.error) {
    throw new Error(
      "Unable to load saved answers."
    )
  }

  const snapshots =
    (snapshotResponse.data ??
      []) as AttemptQuestionRow[]

  const questionIds = snapshots.map(
    (snapshot) =>
      snapshot.question_id
  )

  let questions: QuestionRow[] = []
  let options: OptionRow[] = []

  if (questionIds.length > 0) {
    const [
      questionsResponse,
      optionsResponse,
    ] = await Promise.all([
      supabaseAdmin
        .schema("development")
        .from("quiz_questions")
        .select("id, question_text")
        .in("id", questionIds),

      supabaseAdmin
        .schema("development")
        .from(
          "quiz_question_options"
        )
        .select(`
          id,
          question_id,
          option_text
        `)
        .in(
          "question_id",
          questionIds
        ),
    ])

    if (questionsResponse.error) {
      throw new Error(
        "Unable to load quiz questions."
      )
    }

    if (optionsResponse.error) {
      throw new Error(
        "Unable to load answer options."
      )
    }

    questions =
      (questionsResponse.data ??
        []) as QuestionRow[]

    options =
      (optionsResponse.data ??
        []) as OptionRow[]
  }

  const questionById = new Map(
    questions.map((question) => [
      question.id,
      question,
    ])
  )

  const optionById = new Map(
    options.map((option) => [
      option.id,
      option,
    ])
  )

  const answerByAttemptQuestion =
    new Map(
      (
        answersResponse.data ??
        []
      ).map(
        (answer: SavedAnswerRow) => [
          answer.attempt_question_id,
          answer.selected_option_id,
        ]
      )
    )

  return {
    attempt: {
      id: attempt.id,
      assessmentId:
        attempt.assessment_id,
      attemptNumber:
        attempt.attempt_number,
      status: attempt.status,
      startedAt: attempt.started_at,
      expiresAt: attempt.expires_at,
    },

    assessment: {
      id: assessmentResponse.data.id,
      title:
        assessmentResponse.data.title,
      timeLimitMinutes:
        assessmentResponse.data
          .time_limit_minutes,
      maxAttempts:
        assessmentResponse.data
          .max_attempts,
    },

    version: {
      id: versionResponse.data.id,
      language:
        versionResponse.data.language,
      title: versionResponse.data.title,
      instructions:
        versionResponse.data
          .instructions,
    },

    questions: snapshots.map(
      (snapshot) => {
        const question =
          questionById.get(
            snapshot.question_id
          )

        const optionIds =
          Array.isArray(
            snapshot.option_order
          )
            ? snapshot.option_order
            : []

        return {
          attemptQuestionId:
            snapshot.id,
          position:
            snapshot.display_position,
          questionText:
            question?.question_text ??
            "Question unavailable.",
          selectedOptionId:
            answerByAttemptQuestion.get(
              snapshot.id
            ) ?? null,

          options: optionIds
            .map((optionId) =>
              optionById.get(optionId)
            )
            .filter(
              (
                option
              ): option is OptionRow =>
                Boolean(option)
            )
            .map((option) => ({
              id: option.id,
              text: option.option_text,
            })),
        }
      }
    ),
  }
}