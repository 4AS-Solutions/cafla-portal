"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import { usePathname, useRouter } from "next/navigation"

import { supabase } from "@/src/lib/supabase/client"

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


  const router = useRouter()

  const pathname = usePathname()

  const [user, setUser] = useState<any>(null)

  const [profile, setProfile] = useState<any>(null)

  const [loading, setLoading] = useState(true)

  // =========================================
  // 🔥 LOAD PROFILE
  // =========================================
  async function loadProfile(userId: string) {

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error) {

      console.error("❌ Profile load error:", error)

      setProfile(null)

      return
    }

    setProfile(data ?? null)
  }

  // =========================================
  // 🔥 SPECIAL ROUTES
  // =========================================
  const isCallbackRoute = pathname === "/auth/callback"

  const isInviteFlow =
    pathname === "/complete-profile" &&
    typeof window !== "undefined" &&
    window.location.hash.includes("access_token")

  // =========================================
  // 🔥 AUTH INIT
  // =========================================
  useEffect(() => {

    let mounted = true

    // 🚫 CALLBACK ROUTE
    if (isCallbackRoute) {

      setLoading(false)

      return
    }

    // 🚫 INVITE FLOW
    if (isInviteFlow) {

      setLoading(false)

      return
    }

    async function initializeAuth() {

      try {

        console.log("🔐 Initializing auth session...")

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        const user = session?.user ?? null

        // console.log( "✅ Session loaded:", user?.id ?? "NO USER" )
        console.log( "✅ Session loaded:")

        if (!mounted) return

        // 🚨 SESSION INVALID / EXPIRED
        if (error || !user) {

          setUser(null)

          setProfile(null)

          setLoading(false)

          return
        }

        setUser(user)

        await loadProfile(user.id)

      } catch (error) {

        console.error(
          "❌ Auth initialization error:",
          error
        )

        setUser(null)

        setProfile(null)

      } finally {

        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // =========================================
    // 🔥 AUTH LISTENER
    // =========================================
    const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {

        if (!mounted) return

        console.log("🔐 Auth event:", event)

        if (event === "SIGNED_OUT") {

          setUser(null)

          setProfile(null)

          setLoading(false)

          window.location.replace("/login")

          return
        }

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {

          const currentUser = session?.user ?? null

          setUser(currentUser)

          if (!currentUser) {

            setProfile(null)

            setLoading(false)

            return
          }

          setTimeout(() => {

            if (!mounted) return

            void loadProfile(currentUser.id)
              .catch((error) => {

                console.error(
                  "❌ Listener profile error:",
                  error
                )

                if (mounted) {
                  setProfile(null)
                }
              })
              .finally(() => {

                if (mounted) {
                  setLoading(false)
                }
              })

          }, 0)
        }
      })

    // =========================================
    // 🔥 CLEANUP
    // =========================================
    return () => {

      mounted = false

      subscription.unsubscribe()
    }

  }, [])

  // =========================================
  // 🔥 PROVIDER
  // =========================================
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