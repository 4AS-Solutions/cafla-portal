import { getSupabaseAdmin } from "@/src/lib/supabase/admin"

export type AdminQuizMemberStatus =
  | "not_started"
  | "in_progress"
  | "completed"

export type AdminQuizResultMember = {
  memberId: string
  fullName: string

  status: AdminQuizMemberStatus

  bestScore: number | null
  bestAttemptId: string | null
  bestAttemptNumber: number | null

  attemptsUsed: number
  attemptsRemaining: number
  maxAttempts: number

  language: "es" | "en" | null

  correctCount: number | null
  totalQuestions: number | null
  timeUsedSeconds: number | null

  hasExpiredAttempt: boolean
  attemptsExhausted: boolean
  reviewUnlocked: boolean
  needsAttention: boolean

  lastActivityAt: string | null
  completedAt: string | null

  countsForScore: boolean
}

export type AdminQuizResults = {
  assessment: {
    id: string
    title: string
    description: string | null

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
    openFrom: string | null
    openUntil: string | null
  }

  summary: {
    eligibleMembers: number

    completedMembers: number
    inProgressMembers: number
    notStartedMembers: number

    completionRate: number

    totalAttempts: number
    completedAttempts: number
    inProgressAttempts: number
    expiredAttempts: number

    averageBestScore: number | null
    highestScore: number | null
    lowestScore: number | null
    perfectMembers: number
    needsAttentionMembers: number
  }

  members: AdminQuizResultMember[]
}

type CycleMemberRow = {
  member_id: string
}

type MemberRow = {
  id: string
  full_name: string | null
}

type VersionRow = {
  id: string
  language: "es" | "en"
}

type AttemptRow = {
  id: string
  member_id: string
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
  time_used_seconds: number | null

  started_at: string
  submitted_at: string | null
  expires_at: string
}

export async function getAdminQuizResults(
  assessmentId: string
): Promise<AdminQuizResults | null> {
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
      description,
      status,
      cycle_id,
      required,
      counts_for_score,
      max_attempts,
      open_from,
      open_until
    `)
    .eq("id", assessmentId)
    .maybeSingle()

  if (assessmentError) {
    console.error(
      "[QUIZ RESULTS] Assessment error:",
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
    cycleResponse,
    cycleMembersResponse,
    versionsResponse,
    attemptsResponse,
  ] = await Promise.all([
    supabaseAdmin
      .schema("development")
      .from("cycles")
      .select("id, name")
      .eq("id", assessment.cycle_id)
      .single(),

    supabaseAdmin
      .schema("development")
      .from("cycle_members")
      .select("member_id")
      .eq("cycle_id", assessment.cycle_id)
      .eq("status", "active"),

    supabaseAdmin
      .schema("development")
      .from("quiz_versions")
      .select("id, language")
      .eq("assessment_id", assessment.id),

    supabaseAdmin
      .schema("development")
      .from("quiz_attempts")
      .select(`
        id,
        member_id,
        version_id,
        attempt_number,
        status,
        score,
        correct_count,
        total_questions,
        time_used_seconds,
        started_at,
        submitted_at,
        expires_at
      `)
      .eq("assessment_id", assessment.id)
      .order("started_at", {
        ascending: true,
      }),
  ])

  if (cycleResponse.error) {
    throw new Error(
      "Unable to load the development cycle."
    )
  }

  if (cycleMembersResponse.error) {
    throw new Error(
      "Unable to load eligible members."
    )
  }

  if (versionsResponse.error) {
    throw new Error(
      "Unable to load quiz languages."
    )
  }

  if (attemptsResponse.error) {
    throw new Error(
      "Unable to load quiz attempts."
    )
  }

  const cycleMembers =
    (cycleMembersResponse.data ??
      []) as CycleMemberRow[]

  const memberIds = cycleMembers.map(
    (item) => item.member_id
  )

  let members: MemberRow[] = []

  if (memberIds.length > 0) {
    const {
      data: memberData,
      error: membersError,
    } = await supabaseAdmin
      .from("members")
      .select("id, full_name")
      .in("id", memberIds)
      .order("full_name", {
        ascending: true,
      })

    if (membersError) {
      console.error(
        "[QUIZ RESULTS] Members error:",
        membersError
      )

      throw new Error(
        "Unable to load member profiles."
      )
    }

    members =
      (memberData ?? []) as MemberRow[]
  }

  const attempts =
    (attemptsResponse.data ??
      []) as AttemptRow[]

  const validAttempts = attempts.filter(
    (attempt) =>
      attempt.status !== "voided"
  )

  const completedAttempts =
    validAttempts.filter(
      (attempt) =>
        attempt.status === "submitted" ||
        attempt.status === "expired"
    )

  const versionById = new Map(
    (
      versionsResponse.data ??
      []
    ).map((version: VersionRow) => [
      version.id,
      version,
    ])
  )

  const resultMembers =
    members.map(
      (
        member
      ): AdminQuizResultMember => {
        const memberAttempts =
          validAttempts.filter(
            (attempt) =>
              attempt.member_id ===
              member.id
          )

        const memberCompleted =
          memberAttempts.filter(
            (attempt) =>
              attempt.status ===
                "submitted" ||
              attempt.status ===
                "expired"
          )

        const activeAttempt =
          [...memberAttempts]
            .reverse()
            .find(
              (attempt) =>
                attempt.status ===
                "in_progress"
            ) ?? null

        const bestAttempt =
          getBestAttempt(
            memberCompleted
          )

        const attemptsUsed =
          memberAttempts.length

        const attemptsRemaining =
          Math.max(
            assessment.max_attempts -
              attemptsUsed,
            0
          )

        const attemptsExhausted =
          attemptsRemaining === 0

        const bestScore =
          bestAttempt?.score === null ||
          bestAttempt?.score === undefined
            ? null
            : Number(bestAttempt.score)

        const status: AdminQuizMemberStatus =
          activeAttempt
            ? "in_progress"
            : memberCompleted.length > 0
              ? "completed"
              : "not_started"

        const latestAttempt =
          getLatestAttempt(
            memberAttempts
          )

        const languageAttempt =
          activeAttempt ??
          bestAttempt ??
          latestAttempt

        const version =
          languageAttempt
            ? versionById.get(
                languageAttempt.version_id
              )
            : null

        const hasExpiredAttempt =
          memberAttempts.some(
            (attempt) =>
              attempt.status ===
              "expired"
          )

        const reviewUnlocked =
          bestScore === 100 ||
          attemptsExhausted

        const needsAttention =
          status !== "not_started" &&
          (
            hasExpiredAttempt ||
            (bestScore !== null &&
              bestScore < 70) ||
            (attemptsExhausted &&
              bestScore !== 100)
          )

        return {
          memberId: member.id,
          fullName:
            member.full_name?.trim() ||
            "Unnamed member",

          status,

          bestScore,
          bestAttemptId:
            bestAttempt?.id ?? null,
          bestAttemptNumber:
            bestAttempt?.attempt_number ??
            null,

          attemptsUsed,
          attemptsRemaining,
          maxAttempts:
            assessment.max_attempts,

          language:
            version?.language ?? null,

          correctCount:
            bestAttempt?.correct_count ??
            null,

          totalQuestions:
            bestAttempt
              ?.total_questions ?? null,

          timeUsedSeconds:
            bestAttempt
              ?.time_used_seconds ?? null,

          hasExpiredAttempt,
          attemptsExhausted,
          reviewUnlocked,
          needsAttention,

          lastActivityAt:
            getAttemptActivityDate(
              latestAttempt
            ),

          completedAt:
            bestAttempt?.submitted_at ??
            null,

          countsForScore:
            assessment.counts_for_score,
        }
      }
    )

  const completedMembers =
    resultMembers.filter(
      (member) =>
        member.status === "completed"
    )

  const bestScores =
    completedMembers
      .map((member) =>
        member.bestScore
      )
      .filter(
        (score): score is number =>
          score !== null
      )

  const completedAttemptsCount =
    validAttempts.filter(
      (attempt) =>
        attempt.status ===
          "submitted" ||
        attempt.status === "expired"
    ).length

  const inProgressAttemptsCount =
    validAttempts.filter(
      (attempt) =>
        attempt.status ===
        "in_progress"
    ).length

  const expiredAttemptsCount =
    validAttempts.filter(
      (attempt) =>
        attempt.status === "expired"
    ).length

  const eligibleMembers =
    resultMembers.length

  const completedMembersCount =
    completedMembers.length

  const inProgressMembersCount =
    resultMembers.filter(
      (member) =>
        member.status ===
        "in_progress"
    ).length

  const notStartedMembersCount =
    resultMembers.filter(
      (member) =>
        member.status ===
        "not_started"
    ).length

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      description:
        assessment.description,

      status: assessment.status,

      displayStatus:
        resolveDisplayStatus({
          status: assessment.status,
          openFrom:
            assessment.open_from,
          openUntil:
            assessment.open_until,
        }),

      cycleId: assessment.cycle_id,
      cycleName:
        cycleResponse.data.name,

      required: assessment.required,
      countsForScore:
        assessment.counts_for_score,

      maxAttempts:
        assessment.max_attempts,

      openFrom:
        assessment.open_from,
      openUntil:
        assessment.open_until,
    },

    summary: {
      eligibleMembers,

      completedMembers:
        completedMembersCount,

      inProgressMembers:
        inProgressMembersCount,

      notStartedMembers:
        notStartedMembersCount,

      completionRate:
        eligibleMembers === 0
          ? 0
          : Math.round(
              (completedMembersCount /
                eligibleMembers) *
                100
            ),

      totalAttempts:
        validAttempts.length,

      completedAttempts:
        completedAttemptsCount,

      inProgressAttempts:
        inProgressAttemptsCount,

      expiredAttempts:
        expiredAttemptsCount,

      averageBestScore:
        bestScores.length === 0
          ? null
          : roundToTwo(
              bestScores.reduce(
                (total, score) =>
                  total + score,
                0
              ) / bestScores.length
            ),

      highestScore:
        bestScores.length === 0
          ? null
          : Math.max(...bestScores),

      lowestScore:
        bestScores.length === 0
          ? null
          : Math.min(...bestScores),

      perfectMembers:
        resultMembers.filter(
          (member) =>
            member.bestScore === 100
        ).length,

      needsAttentionMembers:
        resultMembers.filter(
          (member) =>
            member.needsAttention
        ).length,
    },

    members: resultMembers,
  }
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

      const dateA = new Date(
        a.submitted_at ??
          a.started_at
      ).getTime()

      const dateB = new Date(
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

function getAttemptActivityDate(
  attempt: AttemptRow | null
) {
  if (!attempt) return null

  return (
    attempt.submitted_at ??
    attempt.started_at
  )
}

function resolveDisplayStatus({
  status,
  openFrom,
  openUntil,
}: {
  status:
    AdminQuizResults["assessment"]["status"]
  openFrom: string | null
  openUntil: string | null
}): AdminQuizResults["assessment"]["displayStatus"] {
  if (status === "draft") {
    return "draft"
  }

  if (status === "archived") {
    return "archived"
  }

  if (status === "closed") {
    return "closed"
  }

  const now = new Date()

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