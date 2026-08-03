"use client"

import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  RotateCcw,
  ScanSearch,
} from "lucide-react"

import StatusBadge from "./StatusBadge"

type ReportStatus =
  | "pending"
  | "submitted"
  | "approved"
  | "revision_required"

type AdminReportCardProps = {
  report: {
    id?: string
    match_id: string
    status: ReportStatus | string
    home_score?: number | null
    away_score?: number | null

    matches?: {
      home_team?: string | null
      away_team?: string | null
      kickoff_at?: string | null
      league?: string | null
      division?: string | null
    } | null
  }
}

const statusStyles: Record<
  ReportStatus,
  {
    card: string
    accent: string
    iconContainer: string
    icon: typeof Eye
    eyebrow: string
    actionLabel: string
    actionClass: string
  }
> = {
  submitted: {
    card: `
      border-sky-400/25
      bg-gradient-to-br
      from-sky-500/[0.07]
      via-[#0B0F0F]
      to-[#0B0F0F]
      shadow-[0_16px_50px_rgba(14,165,233,0.06)]
      hover:border-sky-400/50
      hover:shadow-[0_18px_60px_rgba(14,165,233,0.12)]
    `,
    accent: "bg-sky-400",
    iconContainer:
      "border-sky-400/20 bg-sky-400/10 text-sky-300",
    icon: ScanSearch,
    eyebrow: "Ready for board review",
    actionLabel: "Review Report",
    actionClass: `
      border-sky-400/25
      bg-sky-400/10
      text-sky-200
      hover:border-sky-300/50
      hover:bg-sky-400/15
      hover:text-white
    `,
  },

  revision_required: {
    card: `
      border-orange-400/20
      bg-gradient-to-br
      from-orange-500/[0.06]
      via-[#0B0F0F]
      to-[#0B0F0F]
      hover:border-orange-400/40
    `,
    accent: "bg-orange-400",
    iconContainer:
      "border-orange-400/20 bg-orange-400/10 text-orange-300",
    icon: RotateCcw,
    eyebrow: "Returned for correction",
    actionLabel: "View Revision",
    actionClass: `
      border-orange-400/25
      bg-orange-400/10
      text-orange-200
      hover:border-orange-300/50
      hover:bg-orange-400/15
      hover:text-white
    `,
  },

  pending: {
    card: `
      border-amber-400/15
      bg-gradient-to-br
      from-amber-500/[0.035]
      via-[#0B0F0F]
      to-[#0B0F0F]
      hover:border-amber-400/30
    `,
    accent: "bg-amber-400",
    iconContainer:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    icon: Clock3,
    eyebrow: "Waiting for referee submission",
    actionLabel: "View Match",
    actionClass: `
      border-white/10
      bg-white/[0.025]
      text-gray-200
      hover:border-amber-300/30
      hover:bg-amber-400/[0.07]
      hover:text-white
    `,
  },

  approved: {
    card: `
      border-white/10
      bg-gradient-to-br
      from-emerald-500/[0.025]
      via-[#0B0F0F]
      to-[#0B0F0F]
      hover:border-emerald-500/25
    `,
    accent: "bg-emerald-500/70",
    iconContainer:
      "border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-400",
    icon: CheckCircle2,
    eyebrow: "Review completed",
    actionLabel: "View Report",
    actionClass: `
      border-white/10
      bg-white/[0.025]
      text-gray-200
      hover:border-emerald-400/25
      hover:bg-emerald-400/[0.06]
      hover:text-white
    `,
  },
}

const fallbackStyle = statusStyles.pending

export default function AdminReportCard({
  report,
}: AdminReportCardProps) {
  const router = useRouter()

  const match = report.matches

  const status =
    report.status as ReportStatus

  const config =
    statusStyles[status] ?? fallbackStyle

  const StatusIcon = config.icon

  const hasScore =
    report.home_score !== null &&
    report.home_score !== undefined &&
    report.away_score !== null &&
    report.away_score !== undefined

  const formattedDate = match?.kickoff_at
    ? new Date(
        match.kickoff_at
      ).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Date not available"

  const openReport = () => {
    router.push(
      `/admin/reports/${report.match_id}`
    )
  }

  return (
    <article
      className={`
        group
        relative
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        p-5
        transition-all
        duration-300
        hover:-translate-y-0.5
        ${config.card}
      `}
    >
      {/* STATUS ACCENT */}
      <div
        aria-hidden="true"
        className={`
          absolute
          inset-y-5
          left-0
          w-[3px]
          rounded-r-full
          ${config.accent}
        `}
      />

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`
                flex
                h-8 w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                ${config.iconContainer}
              `}
            >
              <StatusIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-sm
                  font-semibold
                  tracking-tight
                  text-white
                  md:text-base
                "
                title={`${match?.home_team ?? "TBA"} vs ${
                  match?.away_team ?? "TBA"
                }`}
              >
                {match?.home_team ?? "TBA"} vs{" "}
                {match?.away_team ?? "TBA"}
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  font-medium
                  text-gray-500
                "
              >
                {config.eyebrow}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            {formattedDate}
          </p>
        </div>

        <div className="shrink-0">
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* DIVIDER */}
      <div className="my-4 h-px bg-white/[0.06]" />

      {/* FOOTER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-gray-500
            "
          >
            Final score
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            {hasScore
              ? `${report.home_score} – ${report.away_score}`
              : "Not submitted"}
          </p>
        </div>

        <button
          type="button"
          onClick={openReport}
          className={`
            inline-flex
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            px-3.5
            py-2
            text-xs
            font-semibold
            transition-all
            duration-200
            active:scale-[0.97]
            ${config.actionClass}
          `}
        >
          {status === "submitted" ? (
            <ScanSearch className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}

          <span>{config.actionLabel}</span>

          <ArrowUpRight
            className="
              h-3.5 w-3.5
              opacity-60
              transition-transform
              duration-200
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          />
        </button>
      </div>

      {/* SUBMITTED ATTENTION INDICATOR */}
      {status === "submitted" && (
        <div
          className="
            mt-4
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-sky-400/10
            bg-sky-400/[0.05]
            px-3
            py-2
            text-[11px]
            font-medium
            text-sky-200/80
          "
        >
          <span className="relative flex h-2 w-2">
            <span
              className="
                absolute
                inline-flex
                h-full w-full
                animate-ping
                rounded-full
                bg-sky-400
                opacity-50
              "
            />

            <span
              className="
                relative
                inline-flex
                h-2 w-2
                rounded-full
                bg-sky-400
              "
            />
          </span>

          This report is ready for Board review.
        </div>
      )}
    </article>
  )
}