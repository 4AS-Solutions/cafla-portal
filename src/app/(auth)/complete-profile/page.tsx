"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [phone, setPhone] = useState("")
  const [ussfId, setUssfId] = useState("")
  const [grade, setGrade] = useState("")
  const [password, setPassword] = useState("")

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#071f1c] to-[#021312]">
      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[500px] h-[500px] bg-yellow-400/10 blur-[120px] rounded-full bottom-[-200px] right-[-200px]" />

      {/* Container */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-10 animate-logoIntro">
          <Image
            src="/logo/cafla-logo.png"
            alt="CAFLA"
            width={180}
            height={180}
            priority
          />

          <h1 className="text-white text-3xl font-bold mt-4 tracking-wide">
            Complete Profile
          </h1>

          <p className="text-gray-400 text-sm mt-1 text-center">
            Finish setting up your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0B0F0F]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl animate-fadeIn">
          <div className="space-y-5">
            <input
              type="password"
              placeholder="Create password"
              className="w-full bg-[#071f1c] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              placeholder="Phone"
              className="w-full bg-[#071f1c] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              placeholder="USSF ID"
              className="w-full bg-[#071f1c] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={ussfId}
              onChange={(e) => setUssfId(e.target.value)}
            />

            <input
              placeholder="Grade"
              className="w-full bg-[#071f1c] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />

            {error && (
              <p className="text-red-400 text-sm text-center">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition shadow-lg hover:shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          © {new Date().getFullYear()} CAFLA Referee Platform
        </p>
      </div>
    </div>
  )
}