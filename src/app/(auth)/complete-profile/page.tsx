"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/src/lib/supabase/client"

function validatePassword(password: string) {
  const minLength = password.length >= 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  if (!minLength) return "Password must be at least 6 characters long"
  if (!hasUpperCase) return "Password must include at least one uppercase letter"
  if (!hasLowerCase) return "Password must include at least one lowercase letter"
  if (!hasNumber) return "Password must include at least one number"
  if (!hasSymbol) return "Password must include at least one special character"

  return null
}

export default function CompleteProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const hasRun = useRef(false)

  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [phone, setPhone] = useState("")
  const [ussfId, setUssfId] = useState("")
  const [grade, setGrade] = useState("")
  const [password, setPassword] = useState("")

  // 🔥 HANDLE INVITE SESSION (HASH)
  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const handleHash = async () => {
      console.log("🔥 COMPLETE PROFILE INIT")

      const hash = window.location.hash

      if (!hash) {
        console.log("⚠️ NO HASH")
        setReady(true)
        return
      }

      const params = new URLSearchParams(hash.replace("#", ""))

      const access_token = params.get("access_token")
      const refresh_token = params.get("refresh_token")

      if (access_token && refresh_token) {
        console.log("🚀 SETTING SESSION...")

        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (error) {
          console.error("❌ SET SESSION ERROR:", error)
        } else {
          console.log("✅ SESSION SET")

          // 🔥 limpiar URL SIN recargar
          window.history.replaceState({}, "", "/complete-profile")
        }
      }

      setReady(true)
    }

    handleHash()
  }, [])

  // 🔥 LOADING SOLO PARA SETUP INICIAL
  if (!ready) {
    return (
      <div className="text-white flex h-screen items-center justify-center">
        Setting up your account...
      </div>
    )
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError("")

    const passwordError = validatePassword(password)

    if (passwordError) {
      setError(passwordError)
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          ussf_id: ussfId,
          grade,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        setSubmitting(false)
        return
      }

      router.push("/portal")

    } catch {
      setError("Unexpected error, please try again")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#071f1c] to-[#021312]">

      <div className="relative z-10 w-full max-w-md px-6">

        <div className="flex flex-col items-center mb-10">
          <Image src="/logo/cafla-logo.png" alt="CAFLA" width={180} height={180} priority />

          <h1 className="text-white text-2xl font-bold mt-4">
            Complete Profile
          </h1>

          <p className="text-gray-400 text-sm mt-1 text-center">
            Finish setting up your account
          </p>
        </div>

        <div className="bg-[#0B0F0F]/80 border border-white/10 rounded-2xl p-8">

          <div className="space-y-5">

            <input
              type="password"
              placeholder="Create password"
              className="w-full bg-[#071f1c] border border-white/10 rounded-lg px-4 py-3 text-white"
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              placeholder="Phone"
              className="w-full bg-[#071f1c] border border-white/10 rounded-lg px-4 py-3 text-white"
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              placeholder="USSF ID"
              className="w-full bg-[#071f1c] border border-white/10 rounded-lg px-4 py-3 text-white"
              onChange={(e) => setUssfId(e.target.value)}
            />

            <input
              placeholder="Grade"
              className="w-full bg-[#071f1c] border border-white/10 rounded-lg px-4 py-3 text-white"
              onChange={(e) => setGrade(e.target.value)}
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-emerald-500 text-black font-semibold"
            >
              {submitting ? "Saving..." : "Complete Profile"}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}