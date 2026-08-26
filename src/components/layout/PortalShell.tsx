"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { PortalSidebar } from "./PortalSidebar"
import { PortalTopbar } from "./PortalTopbar"

export function PortalShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileSidebarPathname, setMobileSidebarPathname] = useState<string | null>(null)
  const mobileSidebarOpen = mobileSidebarPathname === pathname

  return (
    <div className="portal-layout flex min-h-screen text-white relative overflow-hidden">

      {/* ambient light */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-200px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-yellow-400/6 blur-[160px]" />
      </div>

      {/* Desktop Sidebar */}
      <PortalSidebar />

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-300 md:hidden">
          <button
            aria-label="Close sidebar overlay"
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileSidebarPathname(null)}
          />

          <div className="absolute right-0 top-0 h-full w-[84vw] max-w-[340px] animate-in slide-in-from-right duration-300 ease-out">
            <PortalSidebar
              mobile
              onNavigate={() => setMobileSidebarPathname(null)}
              onClose={() => setMobileSidebarPathname(null)}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">

        <PortalTopbar onOpenMenu={() => setMobileSidebarPathname(pathname)} />

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>

      </div>
    </div>
  )
}
