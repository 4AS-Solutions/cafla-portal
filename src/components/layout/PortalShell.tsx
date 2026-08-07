"use client"

import { useState } from "react"

import { PortalSidebar } from "./PortalSidebar"
import { PortalTopbar } from "./PortalTopbar"

import {
  Sheet,
  SheetContent,
} from "@/src/components/ui/sheet"

export function PortalShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false)

  return (
    <div className="portal-layout relative flex min-h-screen overflow-hidden text-white">

      {/* AMBIENT LIGHT */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-200px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-yellow-400/6 blur-[160px]" />
      </div>

      {/* DESKTOP SIDEBAR */}
      <PortalSidebar />

      {/* MOBILE SIDEBAR */}
      <Sheet
        open={mobileSidebarOpen}
        onOpenChange={
          setMobileSidebarOpen
        }
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className="
            w-[84vw]
            max-w-[340px]
            gap-0
            border-l
            border-white/10
            bg-[#0B0F0F]
            p-0
            text-white
          "
        >
          <PortalSidebar
            mobile
            onNavigate={() =>
              setMobileSidebarOpen(false)
            }
            onClose={() =>
              setMobileSidebarOpen(false)
            }
          />
        </SheetContent>
      </Sheet>

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