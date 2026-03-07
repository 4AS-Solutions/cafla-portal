"use client"

import Image from "next/image"
import Link from "next/link"
import { LayoutDashboard, Users, Calendar, FileText, ClipboardList, BookOpen } from "lucide-react"
import { usePathname } from "next/navigation"

const items = [
  { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { name: "Members", href: "/portal/members", icon: Users },
  { name: "Matches", href: "/portal/matches", icon: Calendar },
  { name: "Reports", href: "/portal/reports", icon: FileText },
  { name: "Attendance", href: "/portal/attendance", icon: ClipboardList },
  { name: "Quizzes", href: "/portal/quizzes", icon: BookOpen },
]

export function PortalSidebar() {
  const pathname = usePathname();
  
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

      {/* Navigation */}

      <nav className="flex flex-col gap-1 p-4 text-sm">

        {items.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted ${
                pathname === item.href ? "bg-muted font-medium" : ""
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}

      </nav>

    </aside>
  )
}