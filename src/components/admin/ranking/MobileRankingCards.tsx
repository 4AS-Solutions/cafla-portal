"use client"

import { getFlags, getLevelBadgeStyles, getOperationalStatus, getScoreTone, getTrendDisplay } from "@/src/lib/ranking/ranking-utils"
import { MetricPill } from "./MetricPill"
import type { Referee } from "./types"


export function MobileRankingCard({ refData }: { refData: Referee }) {
  const score = Number(refData.development_score)
  const tone = getScoreTone(score)
  const status = getOperationalStatus(refData)
  const flags = getFlags(refData)

  const trend = getTrendDisplay(
    refData.trend ?? null,
    Number(refData.trendDiff || 0)
  )

  const TrendIcon = trend?.icon

  return (
    <div className="rounded-2xl border border-white/10 bg-[#07110f]/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Rank #{refData.ranking_position}
          </p>
          <h3 className="mt-2 text-base font-semibold leading-tight text-white">
            {refData.full_name}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Board performance overview
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${getLevelBadgeStyles(
            refData.referee_level
          )}`}
        >
          {refData.referee_level}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
        <div>
          <div className="flex items-center gap-3">
            <p className={`text-3xl font-semibold ${tone.text}`}>
              {score.toFixed(1)}
            </p>
            <span className="text-xs text-zinc-500">/ 100</span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full rounded-full ${tone.bar} ${tone.ring}`}
              style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-end">
          {trend ? (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${trend.color}`}>
              {TrendIcon ? <TrendIcon size={16} strokeWidth={2} /> : null}
              <span>{trend.value}</span>
            </div>
          ) : (
            <span className="text-xs text-zinc-500">—</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${status.styles}`}
        >
          {status.label}
        </span>

        {flags.length === 0 ? (
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            Healthy profile
          </span>
        ) : (
          flags.map((flag) => (
            <span
              key={flag}
              className="inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-300"
            >
              {flag}
            </span>
          ))
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricPill
          label="Attendance"
          value={`${Number(refData.attendance_score).toFixed(0)}%`}
        />
        <MetricPill
          label="Quiz"
          value={`${Number(refData.quiz_score).toFixed(0)}%`}
        />
        <MetricPill
          label="Feedback"
          value={`${Number(refData.peer_feedback_score).toFixed(0)}%`}
        />
        <MetricPill
          label="Reports"
          value={`${Number(refData.report_score).toFixed(0)}%`}
        />
      </div>
    </div>
  )
}