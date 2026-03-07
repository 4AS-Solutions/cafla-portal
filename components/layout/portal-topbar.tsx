"use client"

import Image from "next/image"

export function PortalTopbar() {
  return (
    <header className="flex items-center justify-between border-b px-4 py-3 bg-background">

      {/* Mobile logo */}

      <div className="flex items-center gap-3 md:hidden">

        <Image
          src="/logo/cafla-logo.png"
          alt="CAFLA"
          width={28}
          height={28}
        />

        <span className="font-semibold">
          CAFLA
        </span>

      </div>

      <div className="text-sm text-muted-foreground">
        CAFLA Referee Portal
      </div>

    </header>
  )
}