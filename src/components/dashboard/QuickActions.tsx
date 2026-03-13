"use client"

import Link from "next/link"
import { FileText, FileUser, CalendarDays } from "lucide-react"

type Action = {
  label: string
  href: string
  icon: React.ReactNode
}

export function QuickActions() {

  const actions: Action[] = [
    {
      label: "Submit Report",
      href: "/portal/reports",
      icon: <FileText size={18} />
    },
    {
      label: "Start Evaluation",
      href: "/portal/evaluations",
      icon: <FileUser size={18} />
    },
    {
      label: "View Matches",
      href: "/portal/matches",
      icon: <CalendarDays size={18} />
    }
  ]

  return (
    <div className="space-y-3">

      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Quick Actions
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-200 transition hover:border-yellow-400/30 hover:bg-white/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400">
              {action.icon}
            </span>

            <span className="group-hover:text-white">
              {action.label}
            </span>

          </Link>
        ))}

      </div>

    </div>
  )
}