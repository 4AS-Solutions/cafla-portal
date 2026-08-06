import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type AdminQuizOverview = {
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

    displayStatus:
      | "draft"
      | "upcoming"
      | "available"
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
    contentLockedAt: string | null

    createdAt: string
    publishedAt: string | null
    closedAt: string | null
  }

  versions: {
    id: string
    language: "es" | "en"
    title: string
    description: string | null
    questionCount: number
  }[]

  questionBank: {
    totalGroups: number
    completeGroups: number
    incompleteGroups: number
    invalidatedGroups: number
    ready: boolean
  }

  participation: {
    eligibleMembers: number
    membersStarted: number
    membersCompleted: number
    membersInProgress: number
    membersNotStarted: number
    completionRate: number
  }

  attempts: {
    total: number
    completed: number
    inProgress: number
    expired: number
    averageScore: number | null
    highestScore: number | null
    perfectAttempts: number
  }
}

type AssessmentRow = {
  id: string
  title: string
  description: string | null
  category: AdminQuizOverview["assessment"]["category"]
  status: AdminQuizOverview["assessment"]["status"]

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

  created_at: string
  published_at: string | null
  closed_at: string | null
}

type AttemptRow = {
  id: string
  member_id: string
  status:
    | "in_progress"
    | "submitted"
    | "expired"
    | "voided"
  score: number | string | null
}

export async function getAdminQuizOverview(
  assessmentId: string
): Promise<AdminQuizOverview | null> {
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
      content_locked_at,
      created_at,
      published_at,
      closed_at
    `)
    .eq("id", assessmentId)
    .maybeSingle()

  if (assessmentError) {
    console.error(
      "[QUIZ OVERVIEW] Assessment error:",
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
    attemptsResponse,
    cycleMembersResponse,
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
        description
      `)
      .eq("assessment_id", assessment.id),

    supabaseAdmin
      .schema("development")
      .from("quiz_question_groups")
      .select(`
        id,
        is_invalidated
      `)
      .eq("assessment_id", assessment.id),

    supabaseAdmin
      .schema("development")
      .from("quiz_attempts")
      .select(`
        id,
        member_id,
        status,
        score
      `)
      .eq("assessment_id", assessment.id),

    supabaseAdmin
      .schema("development")
      .from("cycle_members")
      .select("member_id")
      .eq("cycle_id", assessment.cycle_id)
      .eq("status", "active"),
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

  if (attemptsResponse.error) {
    throw new Error(
      "Unable to load quiz attempts."
    )
  }

  if (cycleMembersResponse.error) {
    throw new Error(
      "Unable to load eligible members."
    )
  }

  const versions =
    versionsResponse.data ?? []

  const groups =
    groupsResponse.data ?? []

  const attempts =
    (attemptsResponse.data ?? []) as AttemptRow[]

  const validAttempts =
    attempts.filter(
      (attempt) =>
        attempt.status !== "voided"
    )

  const completedAttempts =
    validAttempts.filter(
      (attempt) =>
        attempt.status === "submitted" ||
        attempt.status === "expired"
    )

  const inProgressAttempts =
    validAttempts.filter(
      (attempt) =>
        attempt.status === "in_progress"
    )

  const expiredAttempts =
    validAttempts.filter(
      (attempt) =>
        attempt.status === "expired"
    )

  const startedMemberIds = new Set(
    validAttempts.map(
      (attempt) => attempt.member_id
    )
  )

  const completedMemberIds = new Set(
    completedAttempts.map(
      (attempt) => attempt.member_id
    )
  )

  const inProgressMemberIds = new Set(
    inProgressAttempts.map(
      (attempt) => attempt.member_id
    )
  )

  const eligibleMembers =
    cycleMembersResponse.data?.length ?? 0

  const numericScores =
    completedAttempts
      .filter(
        (attempt) =>
          attempt.score !== null
      )
      .map((attempt) =>
        Number(attempt.score)
      )

  const questionIdsByVersion =
    new Map<string, number>()

  if (versions.length > 0) {
    const versionIds = versions.map(
      (version) => version.id
    )

    const {
      data: questions,
      error: questionsError,
    } = await supabaseAdmin
      .schema("development")
      .from("quiz_questions")
      .select("version_id")
      .in("version_id", versionIds)

    if (questionsError) {
      throw new Error(
        "Unable to count language questions."
      )
    }

    for (const question of questions ?? []) {
      questionIdsByVersion.set(
        question.version_id,
        (questionIdsByVersion.get(
          question.version_id
        ) ?? 0) + 1
      )
    }
  }

  const completeGroups =
    groups.filter(
      (group) =>
        !group.is_invalidated
    ).length

  const invalidatedGroups =
    groups.filter(
      (group) =>
        group.is_invalidated
    ).length

  const now = new Date()

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      description:
        assessment.description,
      category: assessment.category,
      status: assessment.status,

      displayStatus:
        resolveDisplayStatus({
          status: assessment.status,
          openFrom:
            assessment.open_from,
          openUntil:
            assessment.open_until,
          now,
        }),

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

      contentLockedAt:
        assessment.content_locked_at,

      createdAt:
        assessment.created_at,
      publishedAt:
        assessment.published_at,
      closedAt:
        assessment.closed_at,
    },

    versions: versions.map(
      (version) => ({
        id: version.id,
        language:
          version.language as "es" | "en",
        title: version.title,
        description:
          version.description,
        questionCount:
          questionIdsByVersion.get(
            version.id
          ) ?? 0,
      })
    ),

    questionBank: {
      totalGroups: groups.length,
      completeGroups,
      incompleteGroups: Math.max(
        groups.length -
          invalidatedGroups -
          completeGroups,
        0
      ),
      invalidatedGroups,
      ready:
        completeGroups >=
        assessment.questions_per_attempt,
    },

    participation: {
      eligibleMembers,
      membersStarted:
        startedMemberIds.size,
      membersCompleted:
        completedMemberIds.size,
      membersInProgress:
        inProgressMemberIds.size,
      membersNotStarted: Math.max(
        eligibleMembers -
          startedMemberIds.size,
        0
      ),
      completionRate:
        eligibleMembers === 0
          ? 0
          : Math.round(
              (completedMemberIds.size /
                eligibleMembers) *
                100
            ),
    },

    attempts: {
      total: validAttempts.length,
      completed:
        completedAttempts.length,
      inProgress:
        inProgressAttempts.length,
      expired:
        expiredAttempts.length,

      averageScore:
        numericScores.length === 0
          ? null
          : roundToTwo(
              numericScores.reduce(
                (sum, score) =>
                  sum + score,
                0
              ) / numericScores.length
            ),

      highestScore:
        numericScores.length === 0
          ? null
          : Math.max(
              ...numericScores
            ),

      perfectAttempts:
        numericScores.filter(
          (score) => score === 100
        ).length,
    },
  }
}

function resolveDisplayStatus({
  status,
  openFrom,
  openUntil,
  now,
}: {
  status:
    AdminQuizOverview["assessment"]["status"]
  openFrom: string | null
  openUntil: string | null
  now: Date
}): AdminQuizOverview["assessment"]["displayStatus"] {
  if (status === "draft") {
    return "draft"
  }

  if (status === "archived") {
    return "archived"
  }

  if (status === "closed") {
    return "closed"
  }

  if (
    openFrom &&
    now < new Date(openFrom)
  ) {
    return "upcoming"
  }

  if (
    openUntil &&
    now > new Date(openUntil)
  ) {
    return "closed"
  }

  return "available"
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100
}