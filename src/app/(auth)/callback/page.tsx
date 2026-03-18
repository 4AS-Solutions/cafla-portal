"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/lib/supabase/client"

export default function CallbackPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      // 🔥 esperar a que Supabase procese el token
      await new Promise((resolve) => setTimeout(resolve, 500))

      const { data, error } = await supabase.auth.getSession()

      console.log("Session dat", data);

      console.log("Session error", error);

      if (error || !data.session) {
        router.push("/login")
        return
      }

      const user = data.session.user

      console.log("User data", user);

      const { data: member } = await supabase
        .from("members")
        .select("phone")
        .eq("id", user.id)
        .single()

      if (!member || !member.phone) {
        router.push("/complete-profile")
      } else {
        router.push("/portal")
      }
    }

    handleAuth()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#021312] text-white">
      Loading...
    </div>
  )
}