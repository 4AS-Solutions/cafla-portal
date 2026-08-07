import { supabaseServer } from "@/src/lib/supabase/server"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type PortalQuizHistoryAttemptStatus =
  | "in_progress"
  | "submitted"
  | "expired"

export type PortalQuizHistoryAssessment = {
  assessmentId: string
  title: string
  description: string | null

  maxAttempts: number
  attemptsUsed: number
  attemptsRemaining: number

  bestScore: number | null
  bestAttemptId: string | null
  bestAttemptNumber: number | null

  status:
    | "in_progress"
    | "completed"

  reviewUnlocked: boolean

  languagesUsed: ("es" | "en")[]

  completedAttempts: number
  inProgressAttempts: number
  expiredAttempts: number

  lastActivityAt: string
}

type AttemptRow = {
  id: string
  assessment_id: string
  version_id: string
  attempt_number: number

  status:
    | "in_progress"
    | "submitted"
    | "expired"
    | "voided"

  score: number | string | null

  started_at: string
  submitted_at: string | null
}

type AssessmentRow = {
  id: string
  title: string
  description: string | null
  max_attempts: number
}

type VersionRow = {
  id: string
  assessment_id: string
  language: "es" | "en"
}

export async function getQuizHistory(): Promise<
  PortalQuizHistoryAssessment[]
> {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const supabaseAdmin =
    getSupabaseAdmin()

  /*
   * Retrieve only this member's attempts.
   * Voided attempts are excluded and do
   * not appear in member-facing history.
   */
  const {
    data: attemptsData,
    error: attemptsError,
  } = await supabaseAdmin
    .schema("development")
    .from("quiz_attempts")
    .select(`
      id,
      assessment_id,
      version_id,
      attempt_number,
      status,
      score,
      started_at,
      submitted_at
    `)
    .eq("member_id", user.id)
    .neq("status", "voided")
    .order("started_at", {
      ascending: false,
    })

  if (attemptsError) {
    console.error(
      "[PORTAL QUIZ HISTORY] Attempts error:",
      attemptsError
    )

    throw new Error(
      "Unable to load quiz history."
    )
  }

  const attempts =
    (attemptsData ?? []) as AttemptRow[]

  if (attempts.length === 0) {
    return []
  }

  const assessmentIds = [
    ...new Set(
      attempts.map(
        (attempt) =>
          attempt.assessment_id
      )
    ),
  ]

  const versionIds = [
    ...new Set(
      attempts.map(
        (attempt) =>
          attempt.version_id
      )
    ),
  ]

  const [
    assessmentsResponse,
    versionsResponse,
  ] = await Promise.all([
    supabaseAdmin
      .schema("development")
      .from("quiz_assessments")
      .select(`
        id,
        title,
        description,
        max_attempts
      `)
      .in("id", assessmentIds),

    supabaseAdmin
      .schema("development")
      .from("quiz_versions")
      .select(`
        id,
        assessment_id,
        language
      `)
      .in("id", versionIds),
  ])

  if (assessmentsResponse.error) {
    console.error(
      "[PORTAL QUIZ HISTORY] Assessments error:",
      assessmentsResponse.error
    )

    throw new Error(
      "Unable to load assessment details."
    )
  }

  if (versionsResponse.error) {
    console.error(
      "[PORTAL QUIZ HISTORY] Versions error:",
      versionsResponse.error
    )

    throw new Error(
      "Unable to load quiz languages."
    )
  }

  const assessments =
    (assessmentsResponse.data ??
      []) as AssessmentRow[]

  const versions =
    (versionsResponse.data ??
      []) as VersionRow[]

  const assessmentById = new Map(
    assessments.map(
      (assessment) => [
        assessment.id,
        assessment,
      ]
    )
  )

  const versionById = new Map(
    versions.map(
      (version) => [
        version.id,
        version,
      ]
    )
  )

  const attemptsByAssessment =
    new Map<string, AttemptRow[]>()

  for (const attempt of attempts) {
    const current =
      attemptsByAssessment.get(
        attempt.assessment_id
      ) ?? []

    current.push(attempt)

    attemptsByAssessment.set(
      attempt.assessment_id,
      current
    )
  }

  const history: PortalQuizHistoryAssessment[] =
    []

  for (
    const [
      assessmentId,
      assessmentAttempts,
    ] of attemptsByAssessment
  ) {
    const assessment =
      assessmentById.get(
        assessmentId
      )

    if (!assessment) {
      continue
    }

    const completedAttempts =
      assessmentAttempts.filter(
        (attempt) =>
          attempt.status ===
            "submitted" ||
          attempt.status ===
            "expired"
      )

    const inProgressAttempts =
      assessmentAttempts.filter(
        (attempt) =>
          attempt.status ===
          "in_progress"
      )

    const expiredAttempts =
      assessmentAttempts.filter(
        (attempt) =>
          attempt.status ===
          "expired"
      )

    const bestAttempt =
      getBestAttempt(
        completedAttempts
      )

    const bestScore =
      bestAttempt?.score === null ||
      bestAttempt?.score ===
        undefined
        ? null
        : Number(
            bestAttempt.score
          )

    /*
     * Any non-voided attempt consumes
     * one attempt, including an active one.
     */
    const attemptsUsed =
      assessmentAttempts.length

    const attemptsRemaining =
      Math.max(
        assessment.max_attempts -
          attemptsUsed,
        0
      )

    /*
     * Anti-cheating rule:
     *
     * Detailed review becomes available
     * only after a perfect score OR after
     * all attempts have been consumed.
     */
    const reviewUnlocked =
      bestScore === 100 ||
      attemptsRemaining === 0

    const languagesUsed = [
      ...new Set(
        assessmentAttempts
          .map((attempt) =>
            versionById.get(
              attempt.version_id
            )
          )
          .filter(
            (
              version
            ): version is VersionRow =>
              Boolean(version)
          )
          .map(
            (version) =>
              version.language
          )
      ),
    ]

    const latestAttempt =
      getLatestAttempt(
        assessmentAttempts
      )

    if (!latestAttempt) {
      continue
    }

    history.push({
      assessmentId:
        assessment.id,

      title:
        assessment.title,

      description:
        assessment.description,

      maxAttempts:
        assessment.max_attempts,

      attemptsUsed,

      attemptsRemaining,

      bestScore,

      bestAttemptId:
        bestAttempt?.id ?? null,

      bestAttemptNumber:
        bestAttempt
          ?.attempt_number ?? null,

      status:
        inProgressAttempts.length > 0
          ? "in_progress"
          : "completed",

      reviewUnlocked,

      languagesUsed,

      completedAttempts:
        completedAttempts.length,

      inProgressAttempts:
        inProgressAttempts.length,

      expiredAttempts:
        expiredAttempts.length,

      lastActivityAt:
        latestAttempt
          .submitted_at ??
        latestAttempt.started_at,
    })
  }

  /*
   * Assessments with the newest activity
   * appear first.
   */
  return history.sort(
    (a, b) =>
      new Date(
        b.lastActivityAt
      ).getTime() -
      new Date(
        a.lastActivityAt
      ).getTime()
  )
}

function getBestAttempt(
  attempts: AttemptRow[]
) {
  return [...attempts].sort(
    (a, b) => {
      const scoreA = Number(
        a.score ?? -1
      )

      const scoreB = Number(
        b.score ?? -1
      )

      if (scoreB !== scoreA) {
        return scoreB - scoreA
      }

      const dateA =
        new Date(
          a.submitted_at ??
            a.started_at
        ).getTime()

      const dateB =
        new Date(
          b.submitted_at ??
            b.started_at
        ).getTime()

      return dateB - dateA
    }
  )[0] ?? null
}

function getLatestAttempt(
  attempts: AttemptRow[]
) {
  return [...attempts].sort(
    (a, b) =>
      new Date(
        b.submitted_at ??
          b.started_at
      ).getTime() -
      new Date(
        a.submitted_at ??
          a.started_at
      ).getTime()
  )[0] ?? null
}