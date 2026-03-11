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

  useEffect(() => {

    async function init() {

      const {
        data: { user },
      } = await supabase.auth.getUser()

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

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetch("/auth/refresh")
      }

      const user = session?.user ?? null
      setUser(user)

      if (user) {
        await loadProfile(user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
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