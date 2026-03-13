"use client"

import Image from "next/image"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  CalendarDays,
  BookOpenText,
  ChartLine,
  FileUser,
  Import,
  SquareLibrary,
  FolderClock,
  ClipboardType,
  SquareStar
} from "lucide-react"

import { usePathname } from "next/navigation"
import { useAuth } from "@/src/components/providers/AuthProvider"

type NavItem = {
  name: string
  href: string
  icon: any
}

const memberItems: NavItem[] = [
  { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { name: "Matches", href: "/portal/matches", icon: CalendarDays },
  { name: "Reports", href: "/portal/reports", icon: FileText },
  { name: "Attendance", href: "/portal/attendance", icon: ClipboardList },
  { name: "Quizzes", href: "/portal/quizzes", icon: BookOpenText },
  { name: "Development", href: "/portal/development", icon: ChartLine },
  { name: "Evaluations", href: "/portal/evaluations", icon: FileUser },
]

const boardItems: NavItem[] = [
  { name: "Members", href: "/portal/members", icon: Users },
  { name: "Arbiter Import", href: "/admin/import-arbiter", icon: Import },
  { name: "Reports Management", href: "/admin/reports", icon: SquareLibrary },
  { name: "Attendance Management", href: "/admin/attendance", icon: FolderClock },
  { name: "Quiz Management", href: "/admin/quizzes", icon: ClipboardType },
  { name: "Ranking Referees", href: "/admin/ranking", icon: SquareStar },
]

export function PortalSidebar() {

  const pathname = usePathname()
  const { profile } = useAuth()

  const isBoard = profile?.role === "board"

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0B0F0F] border-r border-white/10">

      {/* Sidebar Header */}

      <div className="h-16 flex items-center justify-center border-b border-white/10">

        <Image
          src="/logo/cafla-logo.png"
          alt="CAFLA"
          width={60}
          height={60}
        />

      </div>

      {/* Member Navigation */}

      <nav className="flex flex-col gap-1 p-4 text-sm">

        {memberItems.map((item) => {

          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                active
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "hover:bg-white/5 text-gray-300"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}

      </nav>

      {isBoard && (
        <>
          <div className="px-4 pt-4 text-xs text-gray-400 uppercase">
            Admin
          </div>

          <nav className="flex flex-col gap-1 p-4 pt-2 text-sm">

            {boardItems.map((item) => {

              const Icon = item.icon
              const active = pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    active
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "hover:bg-white/5 text-gray-300"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              )
            })}

          </nav>
        </>
      )}

    </aside>
  )
}