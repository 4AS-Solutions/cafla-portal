"use client"

import {
  useEffect,
  useState,
} from "react"

import { PortalSidebar } from "./PortalSidebar"
import { PortalTopbar } from "./PortalTopbar"

export function PortalShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false)

  // =========================================
  // MOBILE BODY SCROLL LOCK
  // =========================================
  useEffect(() => {
    document.body.style.overflow =
      mobileSidebarOpen
        ? "hidden"
        : ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileSidebarOpen])

  function closeMobileSidebar() {
    setMobileSidebarOpen(false)
  }

  return (
    <div className="portal-layout relative flex min-h-screen text-white">

      {/* AMBIENT LIGHT */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-200px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-yellow-400/6 blur-[160px]" />
      </div>

      {/* DESKTOP SIDEBAR */}
      <PortalSidebar />

      {/* MOBILE SIDEBAR */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">

          {/* OVERLAY */}
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="flex-1 bg-black/70"
            onClick={closeMobileSidebar}
          />

          {/* SIDEBAR */}
          <div className="h-full w-[84vw] max-w-[340px]">
            <PortalSidebar
              mobile
              onNavigate={
                closeMobileSidebar
              }
              onClose={
                closeMobileSidebar
              }
            />
          </div>

        </div>
      )}

      {/* CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">

        <PortalTopbar
          onOpenMenu={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>

      </div>

    </div>
  )
}