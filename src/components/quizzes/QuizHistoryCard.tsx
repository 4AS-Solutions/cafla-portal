"use client"

import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { formatMatchDate } from "@/src/lib/utils/format-date"

export default function QuizHistoryCard({ attempt }: any) {


  const score = attempt.score

  function getScoreBadge() {
    if (score >= 90) return "bg-green-500/10 text-green-400 border-green-500/30"
    if (score >= 70) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
    return "bg-red-500/10 text-red-400 border-red-500/30"
  }

  return (

    <div className="rounded-2xl border border-white/10 p-5 bg-[#0B0F0F]/80 backdrop-blur-md hover:border-white/20 transition">

      <div className="flex items-center justify-between">

        {/* LEFT */}
        <div className="space-y-1">

          <p className="text-white font-medium">
            {attempt.quizzes.title}
          </p>

          <p className="text-xs text-gray-400">
            { formatMatchDate(attempt.completed_at) }
          </p>

          <p className="text-xs text-gray-500">
            {attempt.total_questions} questions
          </p>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* SCORE BADGE */}
          <div
            className={`px-3 py-1 rounded-full border text-sm font-semibold ${getScoreBadge()}`}
          >
            {score}%
          </div>

          {/* REVIEW BUTTON */}
          <Link href={`/portal/quizzes/review/${attempt.id}`}>

            <Button
              size="sm"
              className="bg-[#0B0F0F] border border-white/10 hover:border-yellow-400/40"
            >
              Review
            </Button>

          </Link>

        </div>

      </div>

    </div>

  )
}