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
    <div className="flex items-center gap-4 text-sm">

      <div className="text-right">

        <div className="font-medium">
          {name}
        </div>

        <div className="text-muted-foreground text-xs">
          {email}
        </div>

      </div>

      <span className="px-2 py-1 text-xs rounded bg-muted">
        {role}
      </span>

      <button
        onClick={logout}
        className="text-xs text-muted-foreground hover:underline"
      >
        Logout
      </button>

    </div>
  )
}