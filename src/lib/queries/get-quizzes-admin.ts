import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type AdminQuizAssessmentStatus =
  | "draft"
  | "upcoming"
  | "available"
  | "closed"
  | "archived"

export type AdminQuizAssessment = {
  id: string
  title: string
  description: string | null
  category:
    | "laws_of_the_game"
    | "competition_rules"
    | "class_review"
    | "other"

  databaseStatus:
    | "draft"
    | "published"
    | "closed"
    | "archived"

  displayStatus: AdminQuizAssessmentStatus

  cycleId: string
  cycleName: string

  required: boolean
  countsForScore: boolean

  maxAttempts: number
  timeLimitMinutes: number
  questionsPerAttempt: number

  openFrom: string | null
  openUntil: string | null

  contentLocked: boolean

  languages: ("es" | "en")[]
  languageCount: number

  questionGroupsCount: number
  validQuestionGroupsCount: number

  eligibleMembers: number
  membersStarted: number
  membersCompleted: number
  membersInProgress: number
  membersNotStarted: number

  totalAttempts: number
  averageScore: number | null
  perfectScores: number

  createdAt: string
  publishedAt: string | null
  closedAt: string | null
}

export type AdminQuizDashboard = {
  cycle: {
    id: string
    name: string
  } | null

  summary: {
    total: number
    draft: number
    upcoming: number
    available: number
    closed: number
    archived: number

    totalAttempts: number
    completedAttempts: number
    averageScore: number | null
  }

  assessments: AdminQuizAssessment[]
}

type AssessmentRow = {
  id: string
  cycle_id: string
  title: string
  description: string | null
  category: AdminQuizAssessment["category"]
  status: AdminQuizAssessment["databaseStatus"]
  required: boolean
  counts_for_score: boolean
  max_attempts: number
  time_limit_minutes: number
  questions_per_attempt: number
  open_from: string | null
  open_until: string | null
  content_locked_at: string | null
  created_at: string
  published_at: string | null
  closed_at: string | null
}

type AttemptRow = {
  id: string
  assessment_id: string
  member_id: string
  status:
    | "in_progress"
    | "submitted"
    | "expired"
    | "voided"
  score: number | string | null
}

export async function getAdminQuizzes(): Promise<AdminQuizDashboard> {
  const supabaseAdmin = getSupabaseAdmin()

  const {
    data: activeCycle,
    error: cycleError,
  } = await supabaseAdmin
    .schema("development")
    .from("cycles")
    .select("id, name")
    .eq("status", "active")
    .maybeSingle()

  if (cycleError) {
    console.error(
      "[QUIZ ADMIN] Active cycle error:",
      cycleError
    )

    throw new Error(
      "Unable to load the active development cycle."
    )
  }

  if (!activeCycle) {
    return {
      cycle: null,
      summary: createEmptySummary(),
      assessments: [],
    }
  }

  const {
    data: assessmentData,
    error: assessmentsError,
  } = await supabaseAdmin
    .schema("development")
    .from("quiz_assessments")
    .select(`
      id,
      cycle_id,
      title,
      description,
      category,
      status,
      required,
      counts_for_score,
      max_attempts,
      time_limit_minutes,
      questions_per_attempt,
      open_from,
      open_until,
      content_locked_at,
      created_at,
      published_at,
      closed_at
    `)
    .eq("cycle_id", activeCycle.id)
    .order("created_at", {
      ascending: false,
    })

  if (assessmentsError) {
    console.error(
      "[QUIZ ADMIN] Assessments error:",
      assessmentsError
    )

    throw new Error(
      "Unable to load quiz assessments."
    )
  }

  const assessments =
    (assessmentData ?? []) as AssessmentRow[]

  if (assessments.length === 0) {
    return {
      cycle: activeCycle,
      summary: createEmptySummary(),
      assessments: [],
    }
  }

  const assessmentIds = assessments.map(
    (assessment) => assessment.id
  )

  const [
    versionsResponse,
    groupsResponse,
    attemptsResponse,
    cycleMembersResponse,
  ] = await Promise.all([
    supabaseAdmin
      .schema("development")
      .from("quiz_versions")
      .select(`
        assessment_id,
        language
      `)
      .in("assessment_id", assessmentIds),

    supabaseAdmin
      .schema("development")
      .from("quiz_question_groups")
      .select(`
        assessment_id,
        is_invalidated
      `)
      .in("assessment_id", assessmentIds),

    supabaseAdmin
      .schema("development")
      .from("quiz_attempts")
      .select(`
        id,
        assessment_id,
        member_id,
        status,
        score
      `)
      .in("assessment_id", assessmentIds),

    supabaseAdmin
      .schema("development")
      .from("cycle_members")
      .select(`
        member_id,
        status
      `)
      .eq("cycle_id", activeCycle.id)
      .eq("status", "active"),
  ])

  if (versionsResponse.error) {
    throw new Error(
      "Unable to load quiz languages."
    )
  }

  if (groupsResponse.error) {
    throw new Error(
      "Unable to load question banks."
    )
  }

  if (attemptsResponse.error) {
    throw new Error(
      "Unable to load quiz attempts."
    )
  }

  if (cycleMembersResponse.error) {
    throw new Error(
      "Unable to load cycle participants."
    )
  }

  const versions =
    versionsResponse.data ?? []

  const questionGroups =
    groupsResponse.data ?? []

  const attempts =
    (attemptsResponse.data ?? []) as AttemptRow[]

  const eligibleMembers =
    cycleMembersResponse.data?.length ?? 0

  const now = new Date()

  const result = assessments.map(
    (assessment): AdminQuizAssessment => {
      const assessmentVersions =
        versions.filter(
          (version) =>
            version.assessment_id ===
            assessment.id
        )

      const groups = questionGroups.filter(
        (group) =>
          group.assessment_id ===
          assessment.id
      )

      const assessmentAttempts =
        attempts.filter(
          (attempt) =>
            attempt.assessment_id ===
            assessment.id &&
            attempt.status !== "voided"
        )

      const completedAttempts =
        assessmentAttempts.filter(
          (attempt) =>
            attempt.status ===
              "submitted" ||
            attempt.status === "expired"
        )

      const inProgressAttempts =
        assessmentAttempts.filter(
          (attempt) =>
            attempt.status ===
            "in_progress"
        )

      const startedMemberIds = new Set(
        assessmentAttempts.map(
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

      const numericScores =
        completedAttempts
          .filter(
            (attempt) =>
              attempt.score !== null
          )
          .map((attempt) =>
            Number(attempt.score)
          )

      const averageScore =
        numericScores.length === 0
          ? null
          : roundToTwo(
              numericScores.reduce(
                (sum, score) =>
                  sum + score,
                0
              ) / numericScores.length
            )

      const perfectScores =
        numericScores.filter(
          (score) => score === 100
        ).length

      const displayStatus =
        resolveAdminStatus({
          databaseStatus:
            assessment.status,
          openFrom:
            assessment.open_from,
          openUntil:
            assessment.open_until,
          now,
        })

      const languages = Array.from(
        new Set(
          assessmentVersions.map(
            (version) =>
              version.language as
                | "es"
                | "en"
          )
        )
      )

      return {
        id: assessment.id,
        title: assessment.title,
        description:
          assessment.description,
        category: assessment.category,

        databaseStatus:
          assessment.status,
        displayStatus,

        cycleId: activeCycle.id,
        cycleName: activeCycle.name,

        required: assessment.required,
        countsForScore:
          assessment.counts_for_score,

        maxAttempts:
          assessment.max_attempts,
        timeLimitMinutes:
          assessment.time_limit_minutes,
        questionsPerAttempt:
          assessment.questions_per_attempt,

        openFrom: assessment.open_from,
        openUntil: assessment.open_until,

        contentLocked: Boolean(
          assessment.content_locked_at
        ),

        languages,
        languageCount:
          languages.length,

        questionGroupsCount:
          groups.length,
        validQuestionGroupsCount:
          groups.filter(
            (group) =>
              !group.is_invalidated
          ).length,

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

        totalAttempts:
          assessmentAttempts.length,
        averageScore,
        perfectScores,

        createdAt:
          assessment.created_at,
        publishedAt:
          assessment.published_at,
        closedAt:
          assessment.closed_at,
      }
    }
  )

  const completedAttempts = attempts.filter(
    (attempt) =>
      attempt.status === "submitted" ||
      attempt.status === "expired"
  )

  const allScores = completedAttempts
    .filter(
      (attempt) => attempt.score !== null
    )
    .map((attempt) =>
      Number(attempt.score)
    )

  return {
    cycle: activeCycle,

    summary: {
      total: result.length,

      draft: result.filter(
        (assessment) =>
          assessment.displayStatus ===
          "draft"
      ).length,

      upcoming: result.filter(
        (assessment) =>
          assessment.displayStatus ===
          "upcoming"
      ).length,

      available: result.filter(
        (assessment) =>
          assessment.displayStatus ===
          "available"
      ).length,

      closed: result.filter(
        (assessment) =>
          assessment.displayStatus ===
          "closed"
      ).length,

      archived: result.filter(
        (assessment) =>
          assessment.displayStatus ===
          "archived"
      ).length,

      totalAttempts: attempts.filter(
        (attempt) =>
          attempt.status !== "voided"
      ).length,

      completedAttempts:
        completedAttempts.length,

      averageScore:
        allScores.length === 0
          ? null
          : roundToTwo(
              allScores.reduce(
                (sum, score) =>
                  sum + score,
                0
              ) / allScores.length
            ),
    },

    assessments: result,
  }
}

function resolveAdminStatus({
  databaseStatus,
  openFrom,
  openUntil,
  now,
}: {
  databaseStatus:
    AdminQuizAssessment["databaseStatus"]
  openFrom: string | null
  openUntil: string | null
  now: Date
}): AdminQuizAssessmentStatus {
  if (databaseStatus === "draft") {
    return "draft"
  }

  if (databaseStatus === "archived") {
    return "archived"
  }

  if (databaseStatus === "closed") {
    return "closed"
  }

  if (
    openFrom &&
    now < new Date(openFrom)
  ) {
    return "upcoming"
  }

  if (
    !openUntil ||
    now < new Date(openUntil)
  ) {
    return "available"
  }

  return "closed"
}

function createEmptySummary() {
  return {
    total: 0,
    draft: 0,
    upcoming: 0,
    available: 0,
    closed: 0,
    archived: 0,
    totalAttempts: 0,
    completedAttempts: 0,
    averageScore: null,
  }
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100
}