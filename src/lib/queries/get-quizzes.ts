import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type QuizLanguage = "es" | "en"

export type MemberQuizStatus =
  | "upcoming"
  | "available"
  | "closed"
  | "archived"

export type MemberQuiz = {
  id: string
  title: string
  description: string | null
  category:
    | "laws_of_the_game"
    | "competition_rules"
    | "class_review"
    | "other"

  cycleId: string
  cycleName: string

  required: boolean
  countsForScore: boolean

  maxAttempts: number
  attemptsUsed: number
  attemptsRemaining: number

  timeLimitMinutes: number
  questionsPerAttempt: number

  openFrom: string | null
  openUntil: string | null

  effectiveOpenFrom: string | null
  effectiveOpenUntil: string | null
  hasIndividualAccess: boolean

  status: MemberQuizStatus

  bestScore: number | null
  firstScore: number | null
  latestScore: number | null
  reviewUnlocked: boolean

  activeAttempt: {
    id: string
    language: QuizLanguage
    expiresAt: string
  } | null

  bestAttemptId: string | null

  languages: {
    versionId: string
    language: QuizLanguage
    title: string
  }[]
}

type AssessmentRow = {
  id: string
  cycle_id: string
  title: string
  description: string | null
  category: MemberQuiz["category"]
  status: "draft" | "published" | "closed" | "archived"
  required: boolean
  counts_for_score: boolean
  max_attempts: number
  time_limit_minutes: number
  questions_per_attempt: number
  open_from: string | null
  open_until: string | null
}

type ResultRow = {
  assessment_id: string
  attempts_used: number | string
  best_score: number | string | null
  first_score: number | string | null
  latest_score: number | string | null
  review_unlocked: boolean
}

type AttemptRow = {
  id: string
  assessment_id: string
  version_id: string
  status: "in_progress" | "submitted" | "expired" | "voided"
  score: number | string | null
  expires_at: string
  started_at: string
}

type VersionRow = {
  id: string
  assessment_id: string
  language: QuizLanguage
  title: string
}

type AccessGrantRow = {
  assessment_id: string
  available_from: string
  available_until: string
}

export async function getQuizzes(
  memberId: string
): Promise<MemberQuiz[]> {
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
      "[QUIZZES] Unable to load active cycle:",
      cycleError
    )
    throw new Error("Unable to load the active development cycle.")
  }

  if (!activeCycle) {
    return []
  }

  const {
    data: cycleMember,
    error: membershipError,
  } = await supabaseAdmin
    .schema("development")
    .from("cycle_members")
    .select(`
      member_id,
      effective_from,
      effective_until,
      status
    `)
    .eq("cycle_id", activeCycle.id)
    .eq("member_id", memberId)
    .maybeSingle()

  if (membershipError) {
    console.error(
      "[QUIZZES] Unable to validate cycle membership:",
      membershipError
    )
    throw new Error("Unable to validate quiz eligibility.")
  }

  if (!cycleMember) {
    return []
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
      open_until
    `)
    .eq("cycle_id", activeCycle.id)
    .in("status", [
      "published",
      "closed",
      "archived",
    ])
    .order("open_from", {
      ascending: false,
      nullsFirst: false,
    })

  if (assessmentsError) {
    console.error(
      "[QUIZZES] Unable to load assessments:",
      assessmentsError
    )
    throw new Error("Unable to load quizzes.")
  }

  const assessments =
    (assessmentData ?? []) as AssessmentRow[]

  if (assessments.length === 0) {
    return []
  }

  const assessmentIds = assessments.map(
    (assessment) => assessment.id
  )

  const [
    versionsResponse,
    attemptsResponse,
    resultsResponse,
    grantsResponse,
  ] = await Promise.all([
    supabaseAdmin
      .schema("development")
      .from("quiz_versions")
      .select(`
        id,
        assessment_id,
        language,
        title
      `)
      .in("assessment_id", assessmentIds),

    supabaseAdmin
      .schema("development")
      .from("quiz_attempts")
      .select(`
        id,
        assessment_id,
        version_id,
        status,
        score,
        expires_at,
        started_at
      `)
      .eq("member_id", memberId)
      .in("assessment_id", assessmentIds)
      .order("started_at", {
        ascending: false,
      }),

    supabaseAdmin
      .schema("development")
      .from("quiz_member_best_results")
      .select(`
        assessment_id,
        attempts_used,
        best_score,
        first_score,
        latest_score,
        review_unlocked
      `)
      .eq("member_id", memberId)
      .in("assessment_id", assessmentIds),

    supabaseAdmin
      .schema("development")
      .from("quiz_access_grants")
      .select(`
        assessment_id,
        available_from,
        available_until
      `)
      .eq("member_id", memberId)
      .is("revoked_at", null)
      .in("assessment_id", assessmentIds)
      .order("available_until", {
        ascending: false,
      }),
  ])

  if (versionsResponse.error) {
    console.error(
      "[QUIZZES] Unable to load language versions:",
      versionsResponse.error
    )
    throw new Error("Unable to load quiz language versions.")
  }

  if (attemptsResponse.error) {
    console.error(
      "[QUIZZES] Unable to load attempts:",
      attemptsResponse.error
    )
    throw new Error("Unable to load quiz attempts.")
  }

  if (resultsResponse.error) {
    console.error(
      "[QUIZZES] Unable to load quiz results:",
      resultsResponse.error
    )
    throw new Error("Unable to load quiz results.")
  }

  if (grantsResponse.error) {
    console.error(
      "[QUIZZES] Unable to load access grants:",
      grantsResponse.error
    )
    throw new Error("Unable to load quiz availability.")
  }

  const versions =
    (versionsResponse.data ?? []) as VersionRow[]

  const attempts =
    (attemptsResponse.data ?? []) as AttemptRow[]

  const results =
    (resultsResponse.data ?? []) as ResultRow[]

  const grants =
    (grantsResponse.data ?? []) as AccessGrantRow[]

  const resultByAssessment = new Map(
    results.map((result) => [
      result.assessment_id,
      result,
    ])
  )

  const versionById = new Map(
    versions.map((version) => [
      version.id,
      version,
    ])
  )

  const now = new Date()

  return assessments
    .filter((assessment) => {
      if (assessment.status === "archived") {
        return true
      }

      if (!assessment.open_from) {
        return true
      }

      const openDate = getLosAngelesDate(
        assessment.open_from
      )

      const effectiveFrom =
        cycleMember.effective_from

      return effectiveFrom <= openDate
    })
    .map((assessment): MemberQuiz => {
      const assessmentVersions = versions
        .filter(
          (version) =>
            version.assessment_id ===
            assessment.id
        )
        .map((version) => ({
          versionId: version.id,
          language: version.language,
          title: version.title,
        }))

      const assessmentAttempts = attempts.filter(
        (attempt) =>
          attempt.assessment_id ===
          assessment.id
      )

      const activeAttemptRow =
        assessmentAttempts.find(
          (attempt) =>
            attempt.status === "in_progress" &&
            new Date(attempt.expires_at) > now
        )

      const activeAttemptVersion =
        activeAttemptRow
          ? versionById.get(
              activeAttemptRow.version_id
            )
          : null

      const validAttempts =
        assessmentAttempts.filter(
          (attempt) =>
            attempt.status === "submitted" ||
            attempt.status === "expired"
        )

      const bestAttempt =
        validAttempts
          .filter(
            (attempt) =>
              attempt.score !== null
          )
          .sort(
            (a, b) =>
              Number(b.score) -
              Number(a.score)
          )[0] ?? null

      const result =
        resultByAssessment.get(
          assessment.id
        )

      const attemptsUsed = Number(
        result?.attempts_used ?? 0
      )

      const currentGrant = grants.find(
        (grant) =>
          grant.assessment_id ===
            assessment.id &&
          new Date(grant.available_from) <=
            now &&
          new Date(grant.available_until) >
            now
      )

      const futureGrant = grants.find(
        (grant) =>
          grant.assessment_id ===
            assessment.id &&
          new Date(grant.available_from) >
            now
      )

      const effectiveOpenFrom =
        currentGrant?.available_from ??
        futureGrant?.available_from ??
        assessment.open_from

      const effectiveOpenUntil =
        currentGrant?.available_until ??
        futureGrant?.available_until ??
        assessment.open_until

      const hasIndividualAccess =
        Boolean(currentGrant || futureGrant)

      const status = resolveQuizStatus({
        assessmentStatus: assessment.status,
        openFrom: effectiveOpenFrom,
        openUntil: effectiveOpenUntil,
        now,
      })

      return {
        id: assessment.id,
        title: assessment.title,
        description:
          assessment.description,
        category: assessment.category,

        cycleId: activeCycle.id,
        cycleName: activeCycle.name,

        required: assessment.required,
        countsForScore:
          assessment.counts_for_score,

        maxAttempts:
          assessment.max_attempts,
        attemptsUsed,
        attemptsRemaining: Math.max(
          assessment.max_attempts -
            attemptsUsed,
          0
        ),

        timeLimitMinutes:
          assessment.time_limit_minutes,
        questionsPerAttempt:
          assessment.questions_per_attempt,

        openFrom: assessment.open_from,
        openUntil: assessment.open_until,

        effectiveOpenFrom,
        effectiveOpenUntil,
        hasIndividualAccess,

        status,

        bestScore:
          result?.best_score === null ||
          result?.best_score === undefined
            ? null
            : Number(result.best_score),

        firstScore:
          result?.first_score === null ||
          result?.first_score === undefined
            ? null
            : Number(result.first_score),

        latestScore:
          result?.latest_score === null ||
          result?.latest_score === undefined
            ? null
            : Number(result.latest_score),

        reviewUnlocked:
          result?.review_unlocked ?? false,

        activeAttempt:
          activeAttemptRow &&
          activeAttemptVersion
            ? {
                id: activeAttemptRow.id,
                language:
                  activeAttemptVersion.language,
                expiresAt:
                  activeAttemptRow.expires_at,
              }
            : null,

        bestAttemptId:
          bestAttempt?.id ?? null,

        languages: assessmentVersions,
      }
    })
}

function resolveQuizStatus({
  assessmentStatus,
  openFrom,
  openUntil,
  now,
}: {
  assessmentStatus:
    | "draft"
    | "published"
    | "closed"
    | "archived"
  openFrom: string | null
  openUntil: string | null
  now: Date
}): MemberQuizStatus {
  if (assessmentStatus === "archived") {
    return "archived"
  }

  if (openFrom && now < new Date(openFrom)) {
    return "upcoming"
  }

  if (
    assessmentStatus === "published" &&
    (!openUntil || now < new Date(openUntil))
  ) {
    return "available"
  }

  return "closed"
}

function getLosAngelesDate(
  value: string
): string {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date(value))
}