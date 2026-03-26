"use client"

import { useRouter } from "next/navigation"

export default function MatchActions({ match }: any) {

  const router = useRouter()

  return (

    <div className="flex gap-3 pt-2">

      {/* VIEW REPORT */}
      <button
        onClick={() => router.push(`/admin/reports/${match.id}`)}
        className="
          px-4 py-2 rounded-lg
          bg-[#0B0F0F]
          border border-white/10
          text-white text-sm
          hover:border-emerald-500/40
          hover:text-emerald-300
          transition
        "
      >
        View Report
      </button>

      {/* FUTURO */}
      {/* Assign referees */}
      {/* Edit match */}

    </div>

  )
}