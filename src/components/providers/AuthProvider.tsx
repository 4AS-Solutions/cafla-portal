"use client"

import { createClient } from "@/src/lib/supabase/client"
import { createContext, useContext, useEffect, useState } from "react"

type AuthContextType = {
  user: any
  profile: any
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("id", userId)
      .single()

    setProfile(data)
  }

  if (typeof window !== "undefined" && window.location.pathname === "/auth/callback") {
    return (
      <AuthContext.Provider value={{ user: null, profile: null, loading: true }}>
        {children}
      </AuthContext.Provider>
    )
  }

  useEffect(() => {
    let isMounted = true

    // 🔥 DETECTAR INVITE FLOW
    const isInviteFlow =
      typeof window !== "undefined" &&
      window.location.pathname === "/complete-profile" &&
      window.location.hash.includes("access_token")

    // 🚫 BLOQUEAR AUTH PROVIDER EN INVITE FLOW
    if (isInviteFlow) {

      setLoading(false)
      return
    }

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) return

      setUser(user)

      if (user) {
        await loadProfile(user.id)
      }

      setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {


      if (!isMounted) return

      if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        window.location.href = "/login"
        return
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const user = session?.user ?? null

        setUser(user)

        if (user) {
          await loadProfile(user.id)
        } else {
          setProfile(null)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}