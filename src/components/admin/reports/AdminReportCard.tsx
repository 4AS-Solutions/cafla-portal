"use client"

import { useRouter } from "next/navigation"
import StatusBadge from "./StatusBadge"

export default function AdminReportCard({ report }: any) {

  const router = useRouter()

  const match = report.matches

  return (

    <div
      className="
        bg-gradient-to-br from-[#0B0F0F] to-[#0B0F0F]/80
        border border-white/10
        rounded-2xl p-5
        hover:border-emerald-500/30
        transition-all
      "
    >

      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">

        <div>
          <p className="text-white font-semibold text-sm md:text-base">
            {match?.home_team} vs {match?.away_team}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {match?.kickoff_at
              ? new Date(match.kickoff_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "No date"}
          </p>
        </div>

        <StatusBadge status={report.status} />

      </div>

      {/* BODY */}
      <div className="mt-4 flex justify-between items-center">

        <div className="text-sm text-gray-300">
          Score:{" "}
          <span className="text-white font-medium">
            {report.home_score} - {report.away_score}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">

          <button
            onClick={() => router.push(`/admin/reports/${report.id}`)}
            className="
              text-xs px-3 py-1.5 rounded-lg
              border border-white/10
              hover:border-white/30
              text-white
            "
          >
            View
          </button>

          {report.status === "submitted" && (
            <>
              <button
                onClick={async () => {
                  await fetch(`/api/admin/reports/${report.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "approved" })
                  })
                  location.reload()
                }}
                className="
                  text-xs px-3 py-1.5 rounded-lg
                  bg-emerald-500 text-black font-medium
                "
              >
                Approve
              </button>

              <button
                onClick={async () => {
                  await fetch(`/api/admin/reports/${report.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "revision_required" })
                  })
                  location.reload()
                }}
                className="
                  text-xs px-3 py-1.5 rounded-lg
                  bg-yellow-500 text-black font-medium
                "
              >
                Review
              </button>
            </>
          )}

        </div>

      </div>

    </div>
  )
}