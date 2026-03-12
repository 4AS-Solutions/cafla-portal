"use client"

import Image from "next/image"
import Link from "next/link"
import { LayoutDashboard, Users, FileText, ClipboardList, CalendarDays, BookOpenText, ChartLine, FileUser, Import, SquareLibrary, FolderClock, ClipboardType, SquareStar } from "lucide-react"
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
    <aside className="hidden md:flex flex-col w-64 border-r bg-card">

      {/* Logo */}

      <div className="flex items-center gap-3 p-4 border-b">

        <Image
          src="/logo/cafla-logo.png"
          alt="CAFLA"
          width={32}
          height={32}
        />

        <span className="font-bold text-lg">
          CAFLA
        </span>

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
              className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted ${
                active ? "bg-muted font-medium" : ""
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}

      </nav>

      {/* Board Section */}

      {isBoard && (
        <>
          <div className="px-4 pt-2 text-xs text-muted-foreground uppercase">
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted ${
                    active ? "bg-muted font-medium" : ""
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