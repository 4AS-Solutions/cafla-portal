"use client"

import Link from "next/link"
import { Calendar, Clock, Eye, Pencil } from "lucide-react"

export default function QuizList({ quizzes }: any) {

  if (!quizzes?.length) {
    return (
      <div className="text-sm text-gray-400">
        No quizzes created yet.
      </div>
    )
  }

  return (

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

      {quizzes.map((quiz: any) => {

        const now = new Date()
        const start = new Date(quiz.open_from)
        const end = new Date(quiz.open_until)

        let status = "Draft"

        if (quiz.open_from && quiz.open_until) {
          if (now < start) status = "Scheduled"
          else if (now >= start && now <= end) status = "Active"
          else status = "Closed"
        }

        return (

          <div
            key={quiz.id}
            className="
              bg-[#0B0F0F]
              border border-white/10
              rounded-2xl
              p-5
              space-y-4
              hover:border-white/20
              transition
            "
          >

            {/* TITLE */}
            <div className="space-y-1">
              <p className="text-white font-medium">
                {quiz.title}
              </p>
              <p className="text-xs text-gray-400">
                {quiz.description || "No description"}
              </p>
            </div>

            {/* STATUS */}
            <div className="text-xs">

              <span
                className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${
                    status === "Active"
                      ? "bg-green-500/20 text-green-400"
                      : status === "Scheduled"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-400"
                  }
                `}
              >
                {status}
              </span>

            </div>

            {/* META */}
            <div className="text-xs text-gray-400 space-y-1">

              <div className="flex items-center gap-2">
                <Calendar size={14} />
                {quiz.open_from
                  ? new Date(quiz.open_from).toLocaleString()
                  : "No start date"}
              </div>

              <div className="flex items-center gap-2">
                <Clock size={14} />
                {quiz.time_limit_minutes || 0} min
              </div>

              <div>
                {quiz.questions_count || 0} questions
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 pt-2">

              <Link
                href={`/admin/quizzes/${quiz.id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
              >
                <Pencil size={14} />
                Edit
              </Link>

              <Link
                href={`/admin/quizzes/${quiz.id}`}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#00A86B] text-black text-sm font-medium"
              >
                <Eye size={14} />
                Preview
              </Link>

            </div>

          </div>
        )
      })}

    </div>
  )
}