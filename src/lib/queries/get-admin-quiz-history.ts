import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type AdminQuizAttemptHistoryItem = {
  id: string
  attemptNumber: number

  status:
    | "in_progress"
    | "submitted"
    | "expired"

  score: number | null

  correctCount: number | null
  totalQuestions: number | null

  language: "es" | "en"

  startedAt: string
  submittedAt: string | null
  expiresAt: string

  timeUsedSeconds: number | null

  isBestAttempt: boolean
  reviewAvailable: boolean
}

export type AdminQuizAttemptHistory = {
  member: {
    id: string
    fullName: string
  }

  assessment: {
    id: string
    title: string
    maxAttempts: number
  }

  summary: {
    attemptsUsed: number
    attemptsRemaining: number

    bestScore: number | null
    bestAttemptId: string | null

    completedAttempts: number
    expiredAttempts: number
    inProgressAttempts: number
  }

  attempts: AdminQuizAttemptHistoryItem[]
}

type AttemptRow = {
  id: string
  version_id: string
  attempt_number: number

  status:
    | "in_progress"
    | "submitted"
    | "expired"
    | "voided"

  score: number | string | null

  correct_count: number | null
  total_questions: number | null

  started_at: string
  submitted_at: string | null
  expires_at: string

  time_used_seconds: number | null
}

type VersionRow = {
  id: string
  language: "es" | "en"
}

export async function getAdminQuizAttemptHistory(
  assessmentId: string,
  memberId: string
): Promise<AdminQuizAttemptHistory | null> {
  const supabaseAdmin = getSupabaseAdmin()

  const [
    assessmentResponse,
    memberResponse,
    versionsResponse,
    attemptsResponse,
  ] = await Promise.all([
    supabaseAdmin
      .schema("development")
      .from("quiz_assessments")
      .select(`
        id,
        title,
        max_attempts
      `)
      .eq("id", assessmentId)
      .maybeSingle(),

    supabaseAdmin
      .from("members")
      .select(`
        id,
        full_name
      `)
      .eq("id", memberId)
      .maybeSingle(),

    supabaseAdmin
      .schema("development")
      .from("quiz_versions")
      .select(`
        id,
        language
      `)
      .eq(
        "assessment_id",
        assessmentId
      ),

    supabaseAdmin
      .schema("development")
      .from("quiz_attempts")
      .select(`
        id,
        version_id,
        attempt_number,
        status,
        score,
        correct_count,
        total_questions,
        started_at,
        submitted_at,
        expires_at,
        time_used_seconds
      `)
      .eq(
        "assessment_id",
        assessmentId
      )
      .eq(
        "member_id",
        memberId
      )
      .neq("status", "voided")
      .order(
        "attempt_number",
        {
          ascending: false,
        }
      ),
  ])

  if (assessmentResponse.error) {
    console.error(
      "[QUIZ ATTEMPT HISTORY] Assessment error:",
      assessmentResponse.error
    )

    throw new Error(
      "Unable to load the assessment."
    )
  }

  if (!assessmentResponse.data) {
    return null
  }

  if (memberResponse.error) {
    console.error(
      "[QUIZ ATTEMPT HISTORY] Member error:",
      memberResponse.error
    )

    throw new Error(
      "Unable to load the member."
    )
  }

  if (!memberResponse.data) {
    return null
  }

  if (versionsResponse.error) {
    console.error(
      "[QUIZ ATTEMPT HISTORY] Versions error:",
      versionsResponse.error
    )

    throw new Error(
      "Unable to load quiz languages."
    )
  }

  if (attemptsResponse.error) {
    console.error(
      "[QUIZ ATTEMPT HISTORY] Attempts error:",
      attemptsResponse.error
    )

    throw new Error(
      "Unable to load attempt history."
    )
  }

  const assessment =
    assessmentResponse.data

  const member =
    memberResponse.data

  const attempts =
    (attemptsResponse.data ??
      []) as AttemptRow[]

  const versions =
    (versionsResponse.data ??
      []) as VersionRow[]

  const versionById = new Map(
    versions.map((version) => [
      version.id,
      version,
    ])
  )

  /*
   * Only submitted / expired attempts
   * participate in best-score logic.
   */
  const completedAttempts =
    attempts.filter(
      (attempt) =>
        attempt.status ===
          "submitted" ||
        attempt.status ===
          "expired"
    )

  const bestAttempt =
    getBestAttempt(
      completedAttempts
    )

  const bestScore =
    bestAttempt?.score === null ||
    bestAttempt?.score === undefined
      ? null
      : Number(bestAttempt.score)

  /*
   * An in-progress attempt already counts
   * as an attempt used, matching Results.
   */
  const attemptsUsed =
    attempts.length

  const attemptsRemaining =
    Math.max(
      assessment.max_attempts -
        attemptsUsed,
      0
    )

  const attemptsExhausted =
    attemptsRemaining === 0

  /*
   * Same review rule used by Results:
   *
   * - perfect score, OR
   * - no attempts remaining.
   *
   * Once review is unlocked, the Board can
   * inspect every completed attempt.
   *
   * The Board review API itself does not
   * depend on this flag; this controls UI.
   */
  const reviewUnlocked =
    bestScore === 100 ||
    attemptsExhausted

  return {
    member: {
      id: member.id,

      fullName:
        member.full_name?.trim() ||
        "Unnamed member",
    },

    assessment: {
      id: assessment.id,
      title: assessment.title,

      maxAttempts:
        assessment.max_attempts,
    },

    summary: {
      attemptsUsed,

      attemptsRemaining,

      bestScore,

      bestAttemptId:
        bestAttempt?.id ?? null,

      completedAttempts:
        completedAttempts.length,

      expiredAttempts:
        attempts.filter(
          (attempt) =>
            attempt.status ===
            "expired"
        ).length,

      inProgressAttempts:
        attempts.filter(
          (attempt) =>
            attempt.status ===
            "in_progress"
        ).length,
    },

    attempts: attempts.map(
      (
        attempt
      ): AdminQuizAttemptHistoryItem => {
        const version =
          versionById.get(
            attempt.version_id
          )

        if (!version) {
          throw new Error(
            `Quiz version not found for attempt ${attempt.id}.`
          )
        }

        const score =
          attempt.score === null ||
          attempt.score === undefined
            ? null
            : Number(
                attempt.score
              )

        const completed =
          attempt.status ===
            "submitted" ||
          attempt.status ===
            "expired"

        return {
          id: attempt.id,

          attemptNumber:
            attempt.attempt_number,

          status:
            attempt.status as
              | "in_progress"
              | "submitted"
              | "expired",

          score,

          correctCount:
            attempt.correct_count,

          totalQuestions:
            attempt.total_questions,

          language:
            version.language,

          startedAt:
            attempt.started_at,

          submittedAt:
            attempt.submitted_at,

          expiresAt:
            attempt.expires_at,

          timeUsedSeconds:
            attempt.time_used_seconds,

          isBestAttempt:
            attempt.id ===
            bestAttempt?.id,

          reviewAvailable:
            completed &&
            reviewUnlocked,
        }
      }
    ),
  }
}

function getBestAttempt(
  attempts: AttemptRow[]
) {
  return [...attempts].sort(
    (a, b) => {
      const scoreA =
        Number(a.score ?? -1)

      const scoreB =
        Number(b.score ?? -1)

      if (scoreB !== scoreA) {
        return scoreB - scoreA
      }

      /*
       * Same tie-breaker as
       * getAdminQuizResults().
       */
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