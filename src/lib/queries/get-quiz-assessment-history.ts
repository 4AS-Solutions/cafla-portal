import { supabaseServer } from "@/src/lib/supabase/server"
import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type PortalQuizAssessmentAttempt = {
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

export type PortalQuizAssessmentHistory = {
  assessment: {
    id: string
    title: string
    description: string | null
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

    reviewUnlocked: boolean
  }

  attempts: PortalQuizAssessmentAttempt[]
}

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

export async function getQuizAssessmentHistory(
  assessmentId: string
): Promise<PortalQuizAssessmentHistory | null> {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const supabaseAdmin =
    getSupabaseAdmin()

  const [
    assessmentResponse,
    versionsResponse,
    attemptsResponse,
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
      .eq("id", assessmentId)
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
        assessment_id,
        version_id,
        member_id,
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
        user.id
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
      "[PORTAL ASSESSMENT HISTORY] Assessment error:",
      assessmentResponse.error
    )

    throw new Error(
      "Unable to load the assessment."
    )
  }

  if (!assessmentResponse.data) {
    return null
  }

  if (versionsResponse.error) {
    console.error(
      "[PORTAL ASSESSMENT HISTORY] Versions error:",
      versionsResponse.error
    )

    throw new Error(
      "Unable to load quiz languages."
    )
  }

  if (attemptsResponse.error) {
    console.error(
      "[PORTAL ASSESSMENT HISTORY] Attempts error:",
      attemptsResponse.error
    )

    throw new Error(
      "Unable to load attempt history."
    )
  }

  const assessment =
    assessmentResponse.data

  const attempts =
    (attemptsResponse.data ??
      []) as AttemptRow[]

  const versions =
    (versionsResponse.data ??
      []) as VersionRow[]

  if (attempts.length === 0) {
    return null
  }

  const versionById = new Map(
    versions.map((version) => [
      version.id,
      version,
    ])
  )

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

  const attemptsUsed =
    attempts.length

  const attemptsRemaining =
    Math.max(
      assessment.max_attempts -
        attemptsUsed,
      0
    )

  const reviewUnlocked =
    bestScore === 100 ||
    attemptsRemaining === 0

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      description:
        assessment.description,
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

      reviewUnlocked,
    },

    attempts: attempts.map(
      (
        attempt
      ): PortalQuizAssessmentAttempt => {
        const version =
          versionById.get(
            attempt.version_id
          )

        if (!version) {
          throw new Error(
            `Quiz version not found for attempt ${attempt.id}.`
          )
        }

        const completed =
          attempt.status ===
            "submitted" ||
          attempt.status ===
            "expired"

        const score =
          attempt.score === null ||
          attempt.score === undefined
            ? null
            : Number(
                attempt.score
              )

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