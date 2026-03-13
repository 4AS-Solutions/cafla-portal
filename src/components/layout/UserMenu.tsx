"use client"

import { createClient } from "@/src/lib/supabase/client"
import { useRouter } from "next/navigation"

export function UserMenu({
  name,
  email,
  role
}: {
  name: string
  email: string
  role: string
}) {

  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="flex items-center gap-4">

      <div className="text-right leading-tight">

        <div className="text-sm font-semibold text-white">
          {name}
        </div>

        <div className="text-xs text-gray-400">
          {email}
        </div>

      </div>

      <span className="px-2 py-1 text-xs rounded-md bg-emerald-500/20 text-emerald-400">
        {role.toUpperCase()}
      </span>

      <button
        onClick={logout}
        className="text-xs text-gray-400 hover:text-white transition"
      >
        Logout
      </button>

    </div>
  )
}