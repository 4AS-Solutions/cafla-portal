"use client"

import { useEffect } from "react"
import { createClient } from "@/src/lib/supabase/client"

export default function AuthCallbackPage() {
  useEffect(() => {
    const run = async () => {

      const supabase = createClient()

      const hash = window.location.hash

      if (!hash) {

        window.location.href = "/login"
        return
      }

      const params = new URLSearchParams(hash.replace("#", ""))

      const access_token = params.get("access_token")
      const refresh_token = params.get("refresh_token")

      if (!access_token || !refresh_token) {

        window.location.href = "/login"
        return
      }


      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (error) {
        console.error("❌ ERROR:", error)
        window.location.href = "/login"
        return
      }


      // limpiar URL
      window.history.replaceState({}, "", "/auth/callback")

      // 🔥 REDIRECT DURO (NO router)
      window.location.href = "/complete-profile"
    }

    run()
  }, [])

  return (
    <div className="text-white flex h-screen items-center justify-center">
      Setting up your session...
    </div>
  )
}