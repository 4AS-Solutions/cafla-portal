"use client"

import type { AdminRankingReferee } from "./types"
import { getEvidenceStatusLabel } from "@/src/lib/development/evidence-status"

export function MobileRankingCard({ refData }: { refData: AdminRankingReferee }) {
  const ranked = refData.ranking_eligible && refData.ranking_position !== null && refData.ranking_score !== null

  return (
    <div className="rounded-2xl border border-white/10 bg-[#07110f]/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            {ranked ? `Rank #${refData.ranking_position}` : "Not Ranked"}
          </p>
          <h3 className="mt-2 text-base font-semibold text-white">{refData.full_name}</h3>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${ranked ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"}`}>
          {ranked ? "Ranked" : getEvidenceStatusLabel(refData.evidence_status)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Ranking" value={refData.ranking_score === null ? "—" : refData.ranking_score.toFixed(2)} />
        <Metric label="Development" value={refData.development_score === null ? "—" : `${refData.development_score.toFixed(0)}%`} />
        <Metric label="Evidence" value={refData.evidence_percentage === null ? "—" : `${refData.evidence_percentage.toFixed(0)}%`} />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-200">{value}</p>
    </div>
  )
}
