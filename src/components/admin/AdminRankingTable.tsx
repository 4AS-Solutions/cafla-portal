"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { MobileRankingCard } from "@/src/components/admin/ranking/MobileRankingCards"
import type { AdminRankingReferee } from "@/src/components/admin/ranking/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { getEvidenceStatusLabel } from "@/src/lib/development/evidence-status"
import { getScoreTone } from "@/src/lib/ranking/ranking-utils"

const MOBILE_PAGE_SIZE = 5

type RankedReferee = AdminRankingReferee & {
  ranking_position: number
  ranking_score: number
}

function isRanked(referee: AdminRankingReferee): referee is RankedReferee {
  return (
    referee.ranking_eligible &&
    referee.ranking_position !== null &&
    referee.ranking_score !== null
  )
}

function formatPercentage(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(0)}%`
}

export function AdminRankingTable({
  referees,
}: {
  referees: AdminRankingReferee[]
}) {
  const [mobilePage, setMobilePage] = useState(1)

  const rankedReferees = referees.filter(isRanked)
  const averageRankingScore = rankedReferees.length > 0
    ? rankedReferees.reduce(
      (total, referee) => total + referee.ranking_score,
        0
      ) / rankedReferees.length
    : null
  const topThree = rankedReferees.slice(0, 3)
  const totalMobilePages = Math.max(
    1,
    Math.ceil(referees.length / MOBILE_PAGE_SIZE)
  )
  const mobileReferees = useMemo(() => {
    const start = (mobilePage - 1) * MOBILE_PAGE_SIZE
    return referees.slice(start, start + MOBILE_PAGE_SIZE)
  }, [mobilePage, referees])

  if (referees.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#07110f]/70 p-8 text-sm text-zinc-400">
        No ranking data available.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Referees" value={referees.length} />
        <SummaryCard
          label="Average Ranking Score"
          value={averageRankingScore === null ? "—" : averageRankingScore.toFixed(1)}
        />
        <SummaryCard label="Ranked" value={rankedReferees.length} tone="emerald" />
        <SummaryCard
          label="Needs Review"
          value={referees.length - rankedReferees.length}
          tone="yellow"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {topThree.map((referee) => {
          const rankingScore = referee.ranking_score
          const tone = getScoreTone(rankingScore)

          return (
            <div
              key={referee.member_id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07110f]/80 p-5 backdrop-blur-md"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Rank #{referee.ranking_position}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {referee.full_name}
                  </h3>
                </div>
                <div className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                  Top {referee.ranking_position}
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Ranking Score</p>
                  <p className={`mt-1 text-3xl font-semibold ${tone.text}`}>
                    {rankingScore.toFixed(2)}
                  </p>
                </div>
                <div className="text-right text-xs text-zinc-400">
                  <p>Development</p>
                  <p className="mt-1 font-semibold text-zinc-200">
                    {formatPercentage(referee.development_score)}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${tone.bar} ${tone.ring}`}
                  style={{ width: `${Math.min(Math.max(rankingScore, 0), 100)}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <InfoPill label="Evidence" value={formatPercentage(referee.evidence_percentage)} />
                <InfoPill label="Status" value={getEvidenceStatusLabel(referee.evidence_status)} />
              </div>
            </div>
          )
        })}
      </section>

      <section className="space-y-4 md:hidden">
        {mobileReferees.map((referee) => (
          <MobileRankingCard key={referee.member_id} refData={referee} />
        ))}
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#07110f]/80 px-4 py-3 backdrop-blur-md">
          <PaginationButton
            disabled={mobilePage === 1}
            onClick={() => setMobilePage((page) => Math.max(page - 1, 1))}
          >
            <ChevronLeft size={16} /> Prev
          </PaginationButton>
          <p className="text-sm font-medium text-white">
            {mobilePage} / {totalMobilePages}
          </p>
          <PaginationButton
            disabled={mobilePage === totalMobilePages}
            onClick={() => setMobilePage((page) => Math.min(page + 1, totalMobilePages))}
          >
            Next <ChevronRight size={16} />
          </PaginationButton>
        </div>
      </section>

      <section className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#07110f]/80 md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableHead className="w-[110px]">Rank</TableHead>
              <TableHead>Referee</TableHead>
              <TableHead>Ranking Score</TableHead>
              <TableHead>Development</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referees.map((referee) => {
              const ranked = isRanked(referee)

              return (
                <TableRow key={referee.member_id} className="border-white/6 hover:bg-white/[0.025]">
                  <TableCell className="font-semibold text-white">
                    {ranked ? `#${referee.ranking_position}` : "Not Ranked"}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-100">{referee.full_name}</TableCell>
                  <TableCell className="font-semibold text-zinc-100">
                    {referee.ranking_score === null ? "—" : referee.ranking_score.toFixed(2)}
                  </TableCell>
                  <TableCell>{formatPercentage(referee.development_score)}</TableCell>
                  <TableCell>
                    <p>{formatPercentage(referee.evidence_percentage)}</p>
                    <p className="text-xs text-zinc-500">{getEvidenceStatusLabel(referee.evidence_status)}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge referee={referee} />
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

function SummaryCard({ label, value, tone }: { label: string; value: string | number; tone?: "emerald" | "yellow" }) {
  const styles = tone === "emerald"
    ? "border-emerald-500/15 bg-emerald-500/[0.05] text-emerald-300"
    : tone === "yellow"
      ? "border-yellow-500/15 bg-yellow-500/[0.05] text-yellow-300"
      : "border-white/10 bg-[#07110f]/80 text-white"

  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 font-medium text-zinc-200">{value}</p>
    </div>
  )
}

function StatusBadge({ referee }: { referee: AdminRankingReferee }) {
  const ranked = isRanked(referee)
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${ranked ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"}`}>
      {ranked ? "Ranked" : getEvidenceStatusLabel(referee.evidence_status)}
    </span>
  )
}

function PaginationButton({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40">
      {children}
    </button>
  )
}
