import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

type AttemptStatus =
  | "in_progress"
  | "submitted"
  | "expired"
  | "voided"

type QuizLanguage = "es" | "en"

type AttemptRow = {
  id: string
  assessment_id: string
  version_id: string
  member_id: string
  attempt_number: number
  status: AttemptStatus
  started_at: string
  expires_at: string
  submitted_at: string | null
  score: number | string | null
  correct_count: number | null
  total_questions: number | null
  time_used_seconds: number | null
}

type SnapshotRow = {
  id: string
  question_group_id: string
  question_id: string
  display_position: number
  option_order: string[]
}

type QuestionRow = {
  id: string
  question_text: string
  explanation: string | null
}

type QuestionGroupRow = {
  id: string
  is_invalidated: boolean
  invalidation_reason: string | null
}

type OptionRow = {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
}

type AnswerRow = {
  attempt_question_id: string
  selected_option_id: string | null
  is_correct: boolean | null
}

export type QuizReviewDetails = {
  attempt: {
    id: string
    attemptNumber: number
    status: "submitted" | "expired"
    score: number
    correctCount: number
    totalQuestions: number
    startedAt: string
    submittedAt: string | null
    timeUsedSeconds: number | null
  }

  assessment: {
    id: string
    title: string
    maxAttempts: number
  }

  version: {
    id: string
    language: QuizLanguage
    title: string
  }

  reviewUnlocked: boolean

  questions: {
    attemptQuestionId: string
    position: number
    questionText: string
    explanation: string | null

    selectedOption: {
      id: string
      text: string
    } | null

    correctOption: {
      id: string
      text: string
    } | null

    options: {
      id: string
      text: string
      isSelected: boolean
      isCorrect: boolean
    }[]

    isCorrect: boolean
    isUnanswered: boolean
    isInvalidated: boolean
    invalidationReason: string | null
  }[]
}

export async function getQuizReview({
  attemptId,
  memberId,
}: {
  attemptId: string
  memberId: string
}): Promise<QuizReviewDetails | null> {
  const supabaseAdmin = getSupabaseAdmin()

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
      total_questions,
      time_used_seconds
    `)
    .eq("id", attemptId)
    .eq("member_id", memberId)
    .maybeSingle()

  if (attemptError) {
    console.error(
      "[QUIZZES] Unable to load review attempt:",
      attemptError
    )

    throw new Error("Unable to load quiz results.")
  }

  if (!attemptData) {
    return null
  }

  const attempt = attemptData as AttemptRow

  if (
    attempt.status !== "submitted" &&
    attempt.status !== "expired"
  ) {
    throw new Error(
      "This quiz attempt has not been completed."
    )
  }

  const [
    assessmentResponse,
    versionResponse,
    resultResponse,
    snapshotResponse,
    answersResponse,
  ] = await Promise.all([
    supabaseAdmin
      .schema("development")
      .from("quiz_assessments")
      .select(`
        id,
        title,
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
        title
      `)
      .eq("id", attempt.version_id)
      .single(),

    supabaseAdmin
      .schema("development")
      .from("quiz_member_best_results")
      .select(`
        review_unlocked
      `)
      .eq("assessment_id", attempt.assessment_id)
      .eq("member_id", memberId)
      .maybeSingle(),

    supabaseAdmin
      .schema("development")
      .from("quiz_attempt_questions")
      .select(`
        id,
        question_group_id,
        question_id,
        display_position,
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
        selected_option_id,
        is_correct
      `)
      .eq("attempt_id", attempt.id),
  ])

  if (assessmentResponse.error) {
    console.error(
      "[QUIZZES] Review assessment error:",
      assessmentResponse.error
    )

    throw new Error("Unable to load the assessment.")
  }

  if (versionResponse.error) {
    console.error(
      "[QUIZZES] Review version error:",
      versionResponse.error
    )

    throw new Error(
      "Unable to load the quiz language."
    )
  }

  if (resultResponse.error) {
    console.error(
      "[QUIZZES] Review permission error:",
      resultResponse.error
    )

    throw new Error(
      "Unable to verify review access."
    )
  }

  if (snapshotResponse.error) {
    console.error(
      "[QUIZZES] Review snapshot error:",
      snapshotResponse.error
    )

    throw new Error(
      "Unable to load quiz questions."
    )
  }

  if (answersResponse.error) {
    console.error(
      "[QUIZZES] Review answers error:",
      answersResponse.error
    )

    throw new Error(
      "Unable to load quiz answers."
    )
  }

  const reviewUnlocked =
    resultResponse.data?.review_unlocked ??
    false

  if (!reviewUnlocked) {
    throw new Error(
      "Detailed review is locked until you score 100% or use all available attempts."
    )
  }

  const snapshots =
    (snapshotResponse.data ??
      []) as SnapshotRow[]

  const questionIds = snapshots.map(
    (snapshot) => snapshot.question_id
  )

  const questionGroupIds = snapshots.map(
    (snapshot) =>
      snapshot.question_group_id
  )

  let questions: QuestionRow[] = []
  let questionGroups: QuestionGroupRow[] = []
  let options: OptionRow[] = []

  if (questionIds.length > 0) {
    const [
      questionsResponse,
      groupsResponse,
      optionsResponse,
    ] = await Promise.all([
      supabaseAdmin
        .schema("development")
        .from("quiz_questions")
        .select(`
          id,
          question_text,
          explanation
        `)
        .in("id", questionIds),

      supabaseAdmin
        .schema("development")
        .from("quiz_question_groups")
        .select(`
          id,
          is_invalidated,
          invalidation_reason
        `)
        .in("id", questionGroupIds),

      supabaseAdmin
        .schema("development")
        .from("quiz_question_options")
        .select(`
          id,
          question_id,
          option_text,
          is_correct
        `)
        .in("question_id", questionIds),
    ])

    if (questionsResponse.error) {
      throw new Error(
        "Unable to load review questions."
      )
    }

    if (groupsResponse.error) {
      throw new Error(
        "Unable to load question status."
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

    questionGroups =
      (groupsResponse.data ??
        []) as QuestionGroupRow[]

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

  const questionGroupById = new Map(
    questionGroups.map((group) => [
      group.id,
      group,
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
        answersResponse.data ?? []
      ).map((answer: AnswerRow) => [
        answer.attempt_question_id,
        answer,
      ])
    )

  return {
    attempt: {
      id: attempt.id,
      attemptNumber:
        attempt.attempt_number,
      status: attempt.status,
      score: Number(attempt.score ?? 0),
      correctCount:
        attempt.correct_count ?? 0,
      totalQuestions:
        attempt.total_questions ?? 0,
      startedAt: attempt.started_at,
      submittedAt:
        attempt.submitted_at,
      timeUsedSeconds:
        attempt.time_used_seconds,
    },

    assessment: {
      id: assessmentResponse.data.id,
      title:
        assessmentResponse.data.title,
      maxAttempts:
        assessmentResponse.data
          .max_attempts,
    },

    version: {
      id: versionResponse.data.id,
      language:
        versionResponse.data.language,
      title: versionResponse.data.title,
    },

    reviewUnlocked,

    questions: snapshots.map(
      (snapshot) => {
        const question =
          questionById.get(
            snapshot.question_id
          )

        const questionGroup =
          questionGroupById.get(
            snapshot.question_group_id
          )

        const answer =
          answerByAttemptQuestion.get(
            snapshot.id
          )

        const selectedOption =
          answer?.selected_option_id
            ? optionById.get(
                answer.selected_option_id
              ) ?? null
            : null

        const correctOption =
          options.find(
            (option) =>
              option.question_id ===
                snapshot.question_id &&
              option.is_correct
          ) ?? null

        const orderedOptionIds =
          Array.isArray(
            snapshot.option_order
          )
            ? snapshot.option_order
            : []

        const orderedOptions =
          orderedOptionIds
            .map((optionId) =>
              optionById.get(optionId)
            )
            .filter(
              (
                option
              ): option is OptionRow =>
                Boolean(option)
            )

        const isInvalidated =
          questionGroup?.is_invalidated ??
          false

        return {
          attemptQuestionId:
            snapshot.id,
          position:
            snapshot.display_position,
          questionText:
            question?.question_text ??
            "Question unavailable.",
          explanation:
            question?.explanation ?? null,

          selectedOption:
            selectedOption
              ? {
                  id: selectedOption.id,
                  text:
                    selectedOption.option_text,
                }
              : null,

          correctOption:
            correctOption
              ? {
                  id: correctOption.id,
                  text:
                    correctOption.option_text,
                }
              : null,

          options: orderedOptions.map(
            (option) => ({
              id: option.id,
              text: option.option_text,
              isSelected:
                option.id ===
                selectedOption?.id,
              isCorrect:
                option.is_correct,
            })
          ),

          isCorrect:
            !isInvalidated &&
            answer?.is_correct === true,

          isUnanswered:
            !answer?.selected_option_id,

          isInvalidated,

          invalidationReason:
            questionGroup
              ?.invalidation_reason ??
            null,
        }
      }
    ),
  }
}