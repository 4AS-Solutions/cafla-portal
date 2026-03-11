"use client"

import Image from "next/image"
import Link from "next/link"
import { LayoutDashboard, Users, Calendar, FileText, ClipboardList, BookOpen, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/src/components/providers/AuthProvider"

type NavItem = {
  name: string
  href: string
  icon: any
}

const memberItems: NavItem[] = [
  { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { name: "Matches", href: "/portal/matches", icon: Calendar },
  { name: "Reports", href: "/portal/reports", icon: FileText },
  { name: "Attendance", href: "/portal/attendance", icon: ClipboardList },
  { name: "Quizzes", href: "/portal/quizzes", icon: BookOpen },
]

const boardItems: NavItem[] = [
  { name: "Members", href: "/portal/members", icon: Users },
  { name: "Admin Import", href: "/admin/import-arbiter", icon: Settings },
  { name: "Reports Management", href: "/admin/reports", icon: FileText },
  { name: "Attendance Management", href: "/admin/attendance", icon: ClipboardList },
  { name: "Quiz Management", href: "/admin/quizzes", icon: BookOpen },
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