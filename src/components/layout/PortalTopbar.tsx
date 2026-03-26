"use client"

import Image from "next/image"
import { Menu } from "lucide-react"
import { UserMenu } from "./UserMenu"
import Link from "next/link"

export function PortalTopbar({
  onOpenMenu,
}: {
  onOpenMenu?: () => void
}) {
  return (
    <header className="flex h-16 items-center border-b border-white/10 bg-[#0B0F0F] px-4 sm:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <Link href="/portal">
          <Image
            src="/logo/cafla-logo.png"
            alt="CAFLA"
            width={30}
            height={30}
          />
      </Link>

        <span className="font-semibold text-yellow-400">
          CAFLA
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <UserMenu className="hidden md:flex" />

        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:border-yellow-400/30 hover:text-yellow-400 md:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}