import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type QuizEditorLanguage = "es" | "en"

export type QuizEditorData = {
  assessment: {
    id: string
    title: string
    description: string | null
    category:
      | "laws_of_the_game"
      | "competition_rules"
      | "class_review"
      | "other"

    status:
      | "draft"
      | "published"
      | "closed"
      | "archived"

    cycleId: string
    cycleName: string

    required: boolean
    countsForScore: boolean

    maxAttempts: number
    timeLimitMinutes: number
    questionsPerAttempt: number

    randomizeQuestions: boolean
    randomizeOptions: boolean

    openFrom: string | null
    openUntil: string | null

    contentLocked: boolean
  }

  versions: {
    id: string
    language: QuizEditorLanguage
    title: string
    description: string
    instructions: string
  }[]

  questionGroupsCount: number
  validQuestionGroupsCount: number
}

type AssessmentRow = {
  id: string
  title: string
  description: string | null
  category: QuizEditorData["assessment"]["category"]
  status: QuizEditorData["assessment"]["status"]

  cycle_id: string

  required: boolean
  counts_for_score: boolean

  max_attempts: number
  time_limit_minutes: number
  questions_per_attempt: number

  randomize_questions: boolean
  randomize_options: boolean

  open_from: string | null
  open_until: string | null

  content_locked_at: string | null
}

export async function getAdminQuizEditor(
  assessmentId: string
): Promise<QuizEditorData | null> {
  const supabaseAdmin = getSupabaseAdmin()

  const {
    data: assessmentData,
    error: assessmentError,
  } = await supabaseAdmin
    .schema("development")
    .from("quiz_assessments")
    .select(`
      id,
      title,
      description,
      category,
      status,
      cycle_id,
      required,
      counts_for_score,
      max_attempts,
      time_limit_minutes,
      questions_per_attempt,
      randomize_questions,
      randomize_options,
      open_from,
      open_until,
      content_locked_at
    `)
    .eq("id", assessmentId)
    .maybeSingle()

  if (assessmentError) {
    console.error(
      "[QUIZ EDITOR] Assessment error:",
      assessmentError
    )

    throw new Error(
      "Unable to load the assessment."
    )
  }

  if (!assessmentData) {
    return null
  }

  const assessment =
    assessmentData as AssessmentRow

  const [
    cycleResponse,
    versionsResponse,
    groupsResponse,
  ] = await Promise.all([
    supabaseAdmin
      .schema("development")
      .from("cycles")
      .select("id, name")
      .eq("id", assessment.cycle_id)
      .single(),

    supabaseAdmin
      .schema("development")
      .from("quiz_versions")
      .select(`
        id,
        language,
        title,
        description,
        instructions
      `)
      .eq("assessment_id", assessment.id)
      .order("language", {
        ascending: true,
      }),

    supabaseAdmin
      .schema("development")
      .from("quiz_question_groups")
      .select(`
        id,
        is_invalidated
      `)
      .eq("assessment_id", assessment.id),
  ])

  if (cycleResponse.error) {
    throw new Error(
      "Unable to load the development cycle."
    )
  }

  if (versionsResponse.error) {
    throw new Error(
      "Unable to load language versions."
    )
  }

  if (groupsResponse.error) {
    throw new Error(
      "Unable to load the question bank."
    )
  }

  const groups = groupsResponse.data ?? []

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      description:
        assessment.description,
      category: assessment.category,
      status: assessment.status,

      cycleId: assessment.cycle_id,
      cycleName:
        cycleResponse.data.name,

      required: assessment.required,
      countsForScore:
        assessment.counts_for_score,

      maxAttempts:
        assessment.max_attempts,
      timeLimitMinutes:
        assessment.time_limit_minutes,
      questionsPerAttempt:
        assessment.questions_per_attempt,

      randomizeQuestions:
        assessment.randomize_questions,
      randomizeOptions:
        assessment.randomize_options,

      openFrom: assessment.open_from,
      openUntil: assessment.open_until,

      contentLocked: Boolean(
        assessment.content_locked_at
      ),
    },

    versions: (
      versionsResponse.data ?? []
    ).map((version) => ({
      id: version.id,
      language:
        version.language as QuizEditorLanguage,
      title: version.title,
      description:
        version.description ?? "",
      instructions:
        version.instructions ?? "",
    })),

    questionGroupsCount:
      groups.length,

    validQuestionGroupsCount:
      groups.filter(
        (group) =>
          !group.is_invalidated
      ).length,
  }
}