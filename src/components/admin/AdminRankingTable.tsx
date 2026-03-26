"use client"

import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { MobileRankingCard } from "@/src/components/admin/ranking/MobileRankingCards"
import { MetricPill } from "@/src/components/admin/ranking/MetricPill"
import type { Referee } from "@/src/components/admin/ranking/types"
import {
  getFlags,
  getLevelBadgeStyles,
  getOperationalStatus,
  getScoreTone,
  getTrendDisplay,
} from "@/src/lib/ranking/ranking-utils"

const MOBILE_PAGE_SIZE = 5

export function AdminRankingTable({ referees }: { referees: Referee[] }) {
  const [mobilePage, setMobilePage] = useState(1)

  if (!referees || referees.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#07110f]/70 p-8 text-sm text-zinc-400">
        No ranking data available.
      </div>
    )
  }

  const totalReferees = referees.length
  const avgScore =
    referees.reduce(
      (acc, ref) => acc + Number(ref.development_score || 0),
      0
    ) / totalReferees

  const activeCount = referees.filter(
    (ref) => getOperationalStatus(ref).label === "Active"
  ).length

  const needsAttentionCount = referees.filter(
    (ref) => getOperationalStatus(ref).label === "Needs Attention"
  ).length

  const atRiskCount = referees.filter(
    (ref) => getOperationalStatus(ref).label === "At Risk"
  ).length

  const topThree = referees.slice(0, 3)

  const totalMobilePages = Math.max(
    1,
    Math.ceil(referees.length / MOBILE_PAGE_SIZE)
  )

  const mobileReferees = useMemo(() => {
    const start = (mobilePage - 1) * MOBILE_PAGE_SIZE
    const end = start + MOBILE_PAGE_SIZE
    return referees.slice(start, end)
  }, [mobilePage, referees])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#07110f]/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Total Referees
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {totalReferees}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#07110f]/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Average Score
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {avgScore.toFixed(1)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] p-5 shadow-[0_0_0_1px_rgba(16,185,129,0.05)] backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/80">
            Active
          </p>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.05] p-5 shadow-[0_0_0_1px_rgba(250,204,21,0.04)] backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.18em] text-yellow-300/80">
            Needs Review
          </p>
          <p className="mt-3 text-3xl font-semibold text-yellow-300">
            {needsAttentionCount + atRiskCount}
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {topThree.map((ref, index) => {
          const rank = index + 1
          const score = Number(ref.development_score)
          const tone = getScoreTone(score)

          return (
            <div
              key={`${ref.full_name}-${rank}`}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07110f]/80 p-5 backdrop-blur-md"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Rank #{rank}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {ref.full_name}
                  </h3>
                </div>

                <div className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                  Top {rank}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <p className={`text-3xl font-semibold ${tone.text}`}>
                  {score.toFixed(1)}
                </p>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getLevelBadgeStyles(
                    ref.referee_level
                  )}`}
                >
                  {ref.referee_level}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${tone.bar} ${tone.ring}`}
                  style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MetricPill
                  label="Attendance"
                  value={`${Number(ref.attendance_score).toFixed(0)}%`}
                />
                <MetricPill
                  label="Quiz"
                  value={`${Number(ref.quiz_score).toFixed(0)}%`}
                />
                <MetricPill
                  label="Feedback"
                  value={`${Number(ref.peer_feedback_score).toFixed(0)}%`}
                />
                <MetricPill
                  label="Reports"
                  value={`${Number(ref.report_score).toFixed(0)}%`}
                />
              </div>
            </div>
          )
        })}
      </section>

      <section className="space-y-4 md:hidden">
        {mobileReferees.map((ref) => (
          <MobileRankingCard
            key={`${ref.full_name}-${ref.ranking_position}`}
            refData={ref}
          />
        ))}

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#07110f]/80 px-4 py-3 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMobilePage((prev) => Math.max(prev - 1, 1))}
            disabled={mobilePage === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Page
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {mobilePage} / {totalMobilePages}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobilePage((prev) => Math.min(prev + 1, totalMobilePages))
            }
            disabled={mobilePage === totalMobilePages}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      <section className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#07110f]/80 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-md md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Referee</TableHead>
              <TableHead className="w-[140px]">Level</TableHead>
              <TableHead className="w-[180px]">Score</TableHead>
              <TableHead className="w-[180px]">Trend</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="w-[280px]">Flags</TableHead>
              <TableHead className="w-[110px]">Attendance</TableHead>
              <TableHead className="w-[100px]">Quiz</TableHead>
              <TableHead className="w-[110px]">Feedback</TableHead>
              <TableHead className="w-[100px]">Reports</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {referees.map((ref) => {
              const score = Number(ref.development_score)
              const tone = getScoreTone(score)
              const status = getOperationalStatus(ref)
              const flags = getFlags(ref)

              return (
                <TableRow
                  key={`${ref.full_name}-${ref.ranking_position}`}
                  className="border-white/6 hover:bg-white/[0.025]"
                >
                  <TableCell className="font-semibold text-white">
                    #{ref.ranking_position}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-100">
                        {ref.full_name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Board performance overview
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getLevelBadgeStyles(
                        ref.referee_level
                      )}`}
                    >
                      {ref.referee_level}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-sm font-semibold ${tone.text}`}>
                          {score.toFixed(1)}
                        </span>
                        <span className="text-xs text-zinc-500">/ 100</span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full rounded-full ${tone.bar}`}
                          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {(() => {
                      const t = getTrendDisplay(
                        ref.trend,
                        Number(ref.trendDiff || 0)
                      )

                      if (!t) {
                        return <span className="text-xs text-zinc-500">—</span>
                      }

                      const Icon = t.icon

                      return (
                        <div className={`flex items-center gap-2 text-sm font-medium ${t.color}`}>
                          <Icon size={16} strokeWidth={2} />
                          <span>{t.value}</span>
                        </div>
                      )
                    })()}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${status.styles}`}
                    >
                      {status.label}
                    </span>
                  </TableCell>

                  <TableCell>
                    {flags.length === 0 ? (
                      <span className="text-sm text-emerald-300">
                        Healthy profile
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {flags.map((flag) => (
                          <span
                            key={flag}
                            className="inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-300"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-zinc-200">
                    {Number(ref.attendance_score).toFixed(0)}%
                  </TableCell>

                  <TableCell className="text-zinc-200">
                    {Number(ref.quiz_score).toFixed(0)}%
                  </TableCell>

                  <TableCell className="text-zinc-200">
                    {Number(ref.peer_feedback_score).toFixed(0)}%
                  </TableCell>

                  <TableCell className="text-zinc-200">
                    {Number(ref.report_score).toFixed(0)}%
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}