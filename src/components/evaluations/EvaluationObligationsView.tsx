import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ListChecks,
} from "lucide-react"

import type {
  EvaluationObligationStatus,
  UserEvaluationObligation,
} from "@/src/lib/queries/get-user-evaluation-obligations"

type EvaluationObligationsViewProps = {
  obligations: UserEvaluationObligation[]
}

type ActivityStatus = {
  label: "Completed" | "Late" | "Missed"
  styles: string
}

const LOS_ANGELES_TIME_ZONE = "America/Los_Angeles"

function formatMatchDate(matchDate: string): string {
  const match = matchDate.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  )

  if (!match) {
    return matchDate
  }

  const [, year, month, day] = match

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day)
      )
    )
  )
}

function formatDeadline(deadline: string): string {
  const date = new Date(deadline)

  if (Number.isNaN(date.getTime())) {
    return "Deadline unavailable"
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: LOS_ANGELES_TIME_ZONE,
  }).format(date)
}

function getTimeRemaining(deadline: string): string {
  const deadlineTime = new Date(deadline).getTime()

  if (Number.isNaN(deadlineTime)) {
    return "Deadline unavailable"
  }

  const millisecondsRemaining = deadlineTime - Date.now()
  const hoursRemaining = Math.ceil(
    millisecondsRemaining / (60 * 60 * 1000)
  )

  if (hoursRemaining <= 0) {
    return "Deadline reached"
  }

  if (hoursRemaining === 1) {
    return "1h remaining"
  }

  return `${hoursRemaining}h remaining`
}

function formatRole(role: string): string {
  const normalized = role.trim().toLowerCase()

  if (normalized === "center") {
    return "Center"
  }

  if (normalized === "ar1") {
    return "AR1"
  }

  if (normalized === "ar2") {
    return "AR2"
  }

  return role
}

function getActivityStatus(
  status: Exclude<EvaluationObligationStatus, "pending">
): ActivityStatus {
  if (status === "completed_on_time") {
    return {
      label: "Completed",
      styles:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    }
  }

  if (status === "completed_late") {
    return {
      label: "Late",
      styles:
        "border-amber-500/20 bg-amber-500/10 text-amber-300",
    }
  }

  return {
    label: "Missed",
    styles: "border-red-500/20 bg-red-500/10 text-red-300",
  }
}

function SummaryItem({
  label,
  value,
  tone = "text-white",
}: {
  label: string
  value: string | number
  tone?: string
}) {
  return (
    <div className="min-w-0 px-4 py-3 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold ${tone}`}>
        {value}
      </p>
    </div>
  )
}

export function EvaluationObligationsView({
  obligations,
}: EvaluationObligationsViewProps) {
  if (obligations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 px-5 py-12 text-center backdrop-blur-md">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
          <ListChecks className="h-5 w-5" />
        </div>
        <p className="mt-4 font-medium text-white">
          No evaluation tasks are available yet.
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
          Evaluations will become available after eligible matches.
        </p>
      </div>
    )
  }

  const pending = obligations.filter(
    (obligation) => obligation.obligation_status === "pending"
  )
  const completedOnTime = obligations.filter(
    (obligation) =>
      obligation.obligation_status === "completed_on_time"
  )
  const missed = obligations.filter(
    (obligation) => obligation.obligation_status === "missed"
  )
  const recentActivity = obligations
    .filter(
      (obligation): obligation is UserEvaluationObligation & {
        obligation_status: Exclude<
          EvaluationObligationStatus,
          "pending"
        >
      } => obligation.obligation_status !== "pending"
    )
    .slice(0, 8)

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/80 backdrop-blur-md">
        <div className="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
          <SummaryItem
            label="Pending"
            value={pending.length}
            tone={pending.length > 0 ? "text-yellow-300" : "text-white"}
          />
          <SummaryItem
            label="Completed"
            value={completedOnTime.length}
            tone="text-emerald-300"
          />
          <SummaryItem
            label="Missed"
            value={missed.length}
            tone={missed.length > 0 ? "text-red-300" : "text-white"}
          />
          <SummaryItem label="Evaluation Window" value="48h" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
            <Clock3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Needs Your Attention
            </h2>
            <p className="text-sm text-gray-500">
              Complete each evaluation within its available window.
            </p>
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] px-5 py-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="font-medium text-white">
                  You&apos;re all caught up.
                </p>
                <p className="mt-0.5 text-sm text-gray-400">
                  You have no pending evaluation tasks.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.map((obligation) => (
              <article
                key={`${obligation.match_id}-${obligation.evaluated_id}`}
                className="group rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-5 shadow-lg shadow-black/20 transition hover:border-emerald-500/25 hover:bg-[#0e1715]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                      {formatMatchDate(obligation.match_date_la)}
                    </p>
                    <h3 className="mt-2 truncate font-semibold text-white">
                      {obligation.home_team} vs {obligation.away_team}
                    </h3>
                  </div>

                  <span className="shrink-0 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-300">
                    Pending
                  </span>
                </div>

                <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.025] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                    Evaluate
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">
                        {obligation.evaluated_name}
                      </p>
                      <p className="mt-0.5 text-sm text-emerald-300">
                        {formatRole(obligation.evaluated_role)}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-gray-400">
                      Your role: {formatRole(obligation.evaluator_role)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-300">
                      {getTimeRemaining(obligation.evaluation_deadline)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Due {formatDeadline(obligation.evaluation_deadline)} PT
                    </p>
                  </div>

                  <Link
                    href={`/portal/evaluations/${obligation.match_id}?referee=${obligation.evaluated_id}`}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-semibold text-black transition hover:bg-yellow-300"
                  >
                    Evaluate
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {recentActivity.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Activity
            </h2>
            <p className="text-sm text-gray-500">
              Evaluations you completed or were expected to complete.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/80">
            <div className="divide-y divide-white/8">
              {recentActivity.map((obligation) => {
                const status = getActivityStatus(
                  obligation.obligation_status
                )

                return (
                  <div
                    key={`${obligation.match_id}-${obligation.evaluated_id}`}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-xs text-gray-500">
                          {formatMatchDate(obligation.match_date_la)}
                        </p>
                        <p className="truncate text-sm font-medium text-white">
                          {obligation.home_team} vs {obligation.away_team}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">
                        Evaluated {obligation.evaluated_name} · {formatRole(obligation.evaluated_role)}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${status.styles}`}
                    >
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
