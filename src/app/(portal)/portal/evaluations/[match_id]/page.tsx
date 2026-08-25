import Link from "next/link"
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, MapPin, UserRoundCheck } from "lucide-react"

import { EvaluationForm } from "@/src/components/evaluations/EvaluationForm"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { getUserEvaluationObligations } from "@/src/lib/queries/get-user-evaluation-obligations"

const LOS_ANGELES_TIME_ZONE = "America/Los_Angeles"

type EvaluationPageProps = {
  params: Promise<{ match_id: string }>
  searchParams: Promise<{ referee?: string | string[] }>
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: LOS_ANGELES_TIME_ZONE,
    timeZoneName: "short",
  }).format(date)
}

function formatRole(role: string): string {
  const normalized = role.trim().toLowerCase()
  if (normalized === "center") return "Center"
  if (normalized === "ar1") return "AR1"
  if (normalized === "ar2") return "AR2"
  return role
}

function getTimeRemaining(deadline: string): string {
  const deadlineTime = new Date(deadline).getTime()
  if (Number.isNaN(deadlineTime)) return "Deadline unavailable"

  const hoursRemaining = Math.ceil((deadlineTime - Date.now()) / (60 * 60 * 1000))
  if (hoursRemaining <= 0) return "Deadline reached"
  if (hoursRemaining === 1) return "1 hour remaining"
  return `${hoursRemaining} hours remaining`
}

function ClosedState({ status }: {
  status: "completed_on_time" | "completed_late" | "missed"
}) {
  const content = {
    completed_on_time: {
      title: "Evaluation completed",
      description: "This evaluation was submitted within the evaluation window and is now closed.",
      icon: CheckCircle2,
      styles: "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300",
    },
    completed_late: {
      title: "Evaluation submitted late",
      description: "This evaluation was submitted after its deadline and is now closed.",
      icon: Clock3,
      styles: "border-amber-500/20 bg-amber-500/[0.06] text-amber-300",
    },
    missed: {
      title: "Evaluation window expired",
      description: "The deadline passed before this evaluation was submitted. It can no longer be completed.",
      icon: AlertCircle,
      styles: "border-red-500/20 bg-red-500/[0.06] text-red-300",
    },
  }[status]
  const Icon = content.icon

  return (
    <section className={`rounded-2xl border p-6 ${content.styles}`}>
      <div className="flex items-start gap-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="font-semibold text-white">{content.title}</h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">{content.description}</p>
          <Link href="/portal/evaluations" className="mt-4 inline-flex text-sm font-semibold text-yellow-300 transition hover:text-yellow-200">
            Return to evaluations
          </Link>
        </div>
      </div>
    </section>
  )
}

export default async function EvaluationPage({ params, searchParams }: EvaluationPageProps) {
  const [{ match_id: matchId }, query, obligations] = await Promise.all([
    params,
    searchParams,
    getUserEvaluationObligations(),
  ])
  const evaluatedId = Array.isArray(query.referee) ? undefined : query.referee
  const obligation = evaluatedId
    ? obligations.find((item) => item.match_id === matchId && item.evaluated_id === evaluatedId)
    : undefined

  if (!obligation) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PortalPageHeader eyebrow="Evaluations" title="Evaluation unavailable" subtitle="This evaluation task could not be found or is not assigned to you." />
        <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
            <div>
              <p className="text-sm leading-6 text-gray-400">Open the evaluation from your assigned tasks to continue.</p>
              <Link href="/portal/evaluations" className="mt-4 inline-flex text-sm font-semibold text-yellow-300 transition hover:text-yellow-200">
                Return to evaluations
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const competition = [obligation.league, obligation.division].filter(Boolean).join(" · ")
  const venue = [obligation.location, obligation.field].filter(Boolean).join(" · ")

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PortalPageHeader eyebrow="Evaluations" title="Submit Evaluation" subtitle="Rate the referee's performance for this match." />

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/80 shadow-lg shadow-black/20">
        <div className="border-b border-white/10 px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Match</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{obligation.home_team} vs {obligation.away_team}</h2>
          {competition && <p className="mt-1 text-sm text-gray-400">{competition}</p>}
        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-2">
          <div className="flex gap-3 bg-[#0B0F0F] px-5 py-4 sm:px-6">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <div><p className="text-xs uppercase tracking-wide text-gray-500">Kickoff</p><p className="mt-1 text-sm text-gray-200">{formatDateTime(obligation.kickoff_at)}</p></div>
          </div>
          <div className="flex gap-3 bg-[#0B0F0F] px-5 py-4 sm:px-6">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <div><p className="text-xs uppercase tracking-wide text-gray-500">Venue</p><p className="mt-1 text-sm text-gray-200">{venue || "Venue unavailable"}</p></div>
          </div>
          <div className="flex gap-3 bg-[#0B0F0F] px-5 py-4 sm:px-6">
            <UserRoundCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Referee to evaluate</p>
              <p className="mt-1 text-sm font-medium text-white">{obligation.evaluated_name}</p>
              <p className="text-xs text-gray-400">{formatRole(obligation.evaluated_role)} · Your role: {formatRole(obligation.evaluator_role)}</p>
            </div>
          </div>
          <div className="flex gap-3 bg-[#0B0F0F] px-5 py-4 sm:px-6">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Evaluation deadline</p>
              <p className="mt-1 text-sm text-gray-200">{formatDateTime(obligation.evaluation_deadline)}</p>
              {obligation.obligation_status === "pending" && <p className="mt-0.5 text-xs font-medium text-yellow-300">{getTimeRemaining(obligation.evaluation_deadline)}</p>}
            </div>
          </div>
        </div>
      </section>

      {obligation.obligation_status === "pending" ? (
        <EvaluationForm matchId={obligation.match_id} evaluatedId={obligation.evaluated_id} />
      ) : (
        <ClosedState status={obligation.obligation_status} />
      )}
    </div>
  )
}
