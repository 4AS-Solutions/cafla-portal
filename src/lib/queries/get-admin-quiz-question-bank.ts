import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type QuestionBankLanguage = "es" | "en"

export type QuestionBankOption = {
  id: string
  text: string
  isCorrect: boolean
  position: number
}

export type QuestionBankTranslation = {
  id: string
  versionId: string
  language: QuestionBankLanguage
  questionText: string
  explanation: string
  options: QuestionBankOption[]
}

export type QuestionBankGroup = {
  id: string
  position: number | null
  questionType:
    | "true_false"
    | "multiple_choice"

  isInvalidated: boolean
  invalidationReason: string | null

  translations: QuestionBankTranslation[]

  completeLanguages: QuestionBankLanguage[]
  missingLanguages: QuestionBankLanguage[]

  isComplete: boolean
  createdAt: string
  updatedAt: string
}

export type AdminQuizQuestionBank = {
  assessment: {
    id: string
    title: string

    status:
      | "draft"
      | "published"
      | "closed"
      | "archived"

    questionsPerAttempt: number
    contentLocked: boolean
  }

  versions: {
    id: string
    language: QuestionBankLanguage
    title: string
  }[]

  groups: QuestionBankGroup[]

  summary: {
    total: number
    valid: number
    invalidated: number
    complete: number
    incomplete: number
    requiredPerAttempt: number
    readyToPublish: boolean
  }
}

type VersionRow = {
  id: string
  language: QuestionBankLanguage
  title: string
}

type GroupRow = {
  id: string
  question_type:
    | "true_false"
    | "multiple_choice"
  position: number | null
  is_invalidated: boolean
  invalidation_reason: string | null
  created_at: string
  updated_at: string
}

type QuestionRow = {
  id: string
  question_group_id: string
  version_id: string
  question_text: string
  explanation: string | null
}

type OptionRow = {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  position: number
}

export async function getAdminQuizQuestionBank(
  assessmentId: string
): Promise<AdminQuizQuestionBank | null> {
  const supabaseAdmin = getSupabaseAdmin()

  const {
    data: assessment,
    error: assessmentError,
  } = await supabaseAdmin
    .schema("development")
    .from("quiz_assessments")
    .select(`
      id,
      title,
      status,
      questions_per_attempt,
      content_locked_at
    `)
    .eq("id", assessmentId)
    .maybeSingle()

  if (assessmentError) {
    console.error(
      "[QUIZ BANK] Assessment error:",
      assessmentError
    )

    throw new Error(
      "Unable to load the assessment."
    )
  }

  if (!assessment) {
    return null
  }

  const [
    versionsResponse,
    groupsResponse,
  ] = await Promise.all([
    supabaseAdmin
      .schema("development")
      .from("quiz_versions")
      .select(`
        id,
        language,
        title
      `)
      .eq("assessment_id", assessmentId)
      .order("language", {
        ascending: true,
      }),

    supabaseAdmin
      .schema("development")
      .from("quiz_question_groups")
      .select(`
        id,
        question_type,
        position,
        is_invalidated,
        invalidation_reason,
        created_at,
        updated_at
      `)
      .eq("assessment_id", assessmentId)
      .order("position", {
        ascending: true,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: true,
      }),
  ])

  if (versionsResponse.error) {
    throw new Error(
      "Unable to load language versions."
    )
  }

  if (groupsResponse.error) {
    throw new Error(
      "Unable to load the question groups."
    )
  }

  const versions =
    (versionsResponse.data ?? []) as VersionRow[]

  const groups =
    (groupsResponse.data ?? []) as GroupRow[]

  if (groups.length === 0) {
    return {
      assessment: {
        id: assessment.id,
        title: assessment.title,
        status: assessment.status,
        questionsPerAttempt:
          assessment.questions_per_attempt,
        contentLocked: Boolean(
          assessment.content_locked_at
        ),
      },

      versions,

      groups: [],

      summary: {
        total: 0,
        valid: 0,
        invalidated: 0,
        complete: 0,
        incomplete: 0,
        requiredPerAttempt:
          assessment.questions_per_attempt,
        readyToPublish: false,
      },
    }
  }

  const groupIds = groups.map(
    (group) => group.id
  )

  const {
    data: questionData,
    error: questionsError,
  } = await supabaseAdmin
    .schema("development")
    .from("quiz_questions")
    .select(`
      id,
      question_group_id,
      version_id,
      question_text,
      explanation
    `)
    .in("question_group_id", groupIds)

  if (questionsError) {
    throw new Error(
      "Unable to load translated questions."
    )
  }

  const questions =
    (questionData ?? []) as QuestionRow[]

  const questionIds = questions.map(
    (question) => question.id
  )

  let options: OptionRow[] = []

  if (questionIds.length > 0) {
    const {
      data: optionData,
      error: optionsError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_question_options")
      .select(`
        id,
        question_id,
        option_text,
        is_correct,
        position
      `)
      .in("question_id", questionIds)
      .order("position", {
        ascending: true,
      })

    if (optionsError) {
      throw new Error(
        "Unable to load question options."
      )
    }

    options =
      (optionData ?? []) as OptionRow[]
  }

  const versionById = new Map(
    versions.map((version) => [
      version.id,
      version,
    ])
  )

  const enabledLanguages =
    versions.map(
      (version) => version.language
    )

  const resultGroups: QuestionBankGroup[] =
    groups.map((group) => {
      const groupQuestions =
        questions.filter(
          (question) =>
            question.question_group_id ===
            group.id
        )

      const translations =
        groupQuestions
          .map((question) => {
            const version =
              versionById.get(
                question.version_id
              )

            if (!version) {
              return null
            }

            const questionOptions =
              options
                .filter(
                  (option) =>
                    option.question_id ===
                    question.id
                )
                .map((option) => ({
                  id: option.id,
                  text: option.option_text,
                  isCorrect:
                    option.is_correct,
                  position:
                    option.position,
                }))

            return {
              id: question.id,
              versionId: version.id,
              language:
                version.language,
              questionText:
                question.question_text,
              explanation:
                question.explanation ?? "",
              options:
                questionOptions,
            }
          })
          .filter(
            (
              translation
            ): translation is QuestionBankTranslation =>
              Boolean(translation)
          )

      const completeLanguages =
        enabledLanguages.filter(
          (language) => {
            const translation =
              translations.find(
                (item) =>
                  item.language ===
                  language
              )

            if (!translation) {
              return false
            }

            const optionCount =
              translation.options.length

            const correctCount =
              translation.options.filter(
                (option) =>
                  option.isCorrect
              ).length

            const validOptionCount =
              group.question_type ===
              "true_false"
                ? optionCount === 2
                : optionCount >= 2 &&
                  optionCount <= 4

            return Boolean(
              translation.questionText.trim() &&
                validOptionCount &&
                correctCount === 1
            )
          }
        )

      const missingLanguages =
        enabledLanguages.filter(
          (language) =>
            !completeLanguages.includes(
              language
            )
        )

      return {
        id: group.id,
        position: group.position,
        questionType:
          group.question_type,

        isInvalidated:
          group.is_invalidated,
        invalidationReason:
          group.invalidation_reason,

        translations,
        completeLanguages,
        missingLanguages,

        isComplete:
          enabledLanguages.length > 0 &&
          missingLanguages.length === 0,

        createdAt: group.created_at,
        updatedAt: group.updated_at,
      }
    })

  const validGroups =
    resultGroups.filter(
      (group) =>
        !group.isInvalidated
    )

  const completeGroups =
    validGroups.filter(
      (group) => group.isComplete
    )

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      status: assessment.status,
      questionsPerAttempt:
        assessment.questions_per_attempt,
      contentLocked: Boolean(
        assessment.content_locked_at
      ),
    },

    versions,

    groups: resultGroups,

    summary: {
      total: resultGroups.length,

      valid: validGroups.length,

      invalidated:
        resultGroups.length -
        validGroups.length,

      complete:
        completeGroups.length,

      incomplete:
        validGroups.length -
        completeGroups.length,

      requiredPerAttempt:
        assessment.questions_per_attempt,

      readyToPublish:
        versions.length > 0 &&
        completeGroups.length >=
          assessment.questions_per_attempt,
    },
  }
}