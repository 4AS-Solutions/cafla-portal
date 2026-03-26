"use client"

import { createClient } from "@/src/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useAuth } from "@/src/components/providers/AuthProvider"
import { LogOut } from "lucide-react"

export function UserMenu({
  mobile = false,
  variant = "default",
  className = "",
}: {
  mobile?: boolean
  variant?: "default" | "info" | "logout"
  className?: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const { profile, user } = useAuth() as any

  const name = profile?.full_name ?? "User"
  const email = user?.email ?? profile?.email ?? ""
  const role = (profile?.role ?? "member").toUpperCase()

  async function logout() {
    try {
      await supabase.auth.signOut()

      window.location.href = "/login" // 🔥 hard reset

    } catch (err) {
      console.error(err)
    }
  }

  if (mobile && variant === "info") {
    return (
      <div>
        <div className="text-sm font-semibold text-white">
          {name}
        </div>

        <div className="mt-1 break-all text-xs text-gray-400">
          {email}
        </div>

        <div className="mt-2 inline-flex rounded-full bg-yellow-400/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-yellow-400">
          {role}
        </div>
      </div>
    )
  }

  if (mobile && variant === "logout") {
    return (
      <button
        onClick={logout}
        className="
          flex w-full items-center justify-center gap-2 
          rounded-xl border border-white/10 
          bg-white/5 px-4 py-3 text-sm font-medium 
          text-gray-200 transition-all duration-200 
          hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-300
          active:bg-red-600/30 active:scale-95
          cursor-pointer
        "
      >
        <LogOut size={16} />
        Logout
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="text-right leading-tight">
        <div className="text-sm font-semibold text-white">
          {name}
        </div>

        <div className="text-xs text-gray-400">
          {email}
        </div>
      </div>

      <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-yellow-400">
        {role}
      </span>

      <button
        onClick={logout}
        className="
          flex items-center gap-2 text-sm text-gray-400 
          transition-all duration-200 
          hover:text-red-400 hover:scale-[1.02]
          cursor-pointer active:scale-95
        "
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  )
}