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
  SquareStar,
  X,
} from "lucide-react"

import { usePathname } from "next/navigation"
import { useAuth } from "@/src/components/providers/AuthProvider"
import { UserMenu } from "./UserMenu"

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
  { name: "Members", href: "/admin/members", icon: Users },
  { name: "Arbiter Import", href: "/admin/import-arbiter", icon: Import },
  { name: "Matches Management", href: "/admin/matches", icon: CalendarDays },
  { name: "Reports Management", href: "/admin/reports", icon: SquareLibrary },
  { name: "Attendance Management", href: "/admin/attendance", icon: FolderClock },
  { name: "Quiz Management", href: "/admin/quizzes", icon: ClipboardType },
  { name: "Ranking Referees", href: "/admin/ranking", icon: SquareStar },
]

export function PortalSidebar({
  mobile = false,
  onNavigate,
  onClose,
}: {
  mobile?: boolean
  onNavigate?: () => void
  onClose?: () => void
}) {
  const pathname = usePathname()
  const { profile } = useAuth()

  const isBoard = profile?.role === "board"

  const containerClass = mobile
    ? "flex h-full flex-col bg-[#0B0F0F] border-l border-white/10 shadow-2xl animate-slideInLeft"
    : "hidden h-screen w-72 flex-col border-r border-white/10 bg-[#0B0F0F] md:flex"

  const linkBase =
    "sidebar-link group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all"

  function isActive(itemHref: string) {
    if (itemHref === "/portal") {
      return pathname === "/portal"
    }
    return pathname.startsWith(itemHref)
  }

  return (
    <aside className={containerClass}>
      {/* HEADER */}
      <div className="flex h-16 items-center border-b border-white/10 px-4">
        {mobile ? (
          <>
            <div className="flex items-center gap-3">
              <Link href="/portal">
                <Image
                  src="/logo/cafla-logo.png"
                  alt="CAFLA"
                  width={40}
                  height={40}
                />
            </Link> 
                <span className="text-base font-semibold text-yellow-400">
                  CAFLA
                </span>
            </div>

            <button
              onClick={onClose}
              className="ml-auto rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <div className="flex w-full justify-center">
            <Link href="/portal">
              <Image
                src="/logo/cafla-logo.png"
                alt="CAFLA"
                width={48}
                height={48}
              />
            </Link>
          </div>
        )}
      </div>

      {/* USER INFO (MOBILE) */}
      {mobile && (
        <div className="border-b border-white/10 p-4">
          <UserMenu mobile variant="info" />
        </div>
      )}

      {/* NAV */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="flex flex-col gap-1">
          {memberItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={`${linkBase} ${
                  active
                    ? "bg-emerald-500/18 text-white ring-1 ring-emerald-500/20"
                    : "text-gray-300 hover:bg-white/5 hover:text-yellow-400"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "text-yellow-400"
                      : "text-gray-400 group-hover:text-yellow-400"
                  }
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {isBoard && (
          <div className="mt-6">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-400/90">
              Admin
            </div>

            <nav className="flex flex-col gap-1">
              {boardItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    className={`${linkBase} ${
                      active
                        ? "bg-yellow-400/15 text-white ring-1 ring-yellow-400/15"
                        : "text-gray-300 hover:bg-white/5 hover:text-yellow-400"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        active
                          ? "text-yellow-400"
                          : "text-gray-400 group-hover:text-yellow-400"
                      }
                    />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      {/* LOGOUT MOBILE */}
      {mobile && (
        <div className="border-t border-white/10 p-4 hover:bg-red-600/10 rounded-lg transition">
          <UserMenu mobile variant="logout" />
        </div>
      )}
    </aside>
  )
}