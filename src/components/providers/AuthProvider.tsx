"use client"

import { createClient } from "@/src/lib/supabase/client"
import { useEffect } from "react"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetch("/auth/refresh")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <>{children}</>
}