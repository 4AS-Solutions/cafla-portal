"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin() {
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (!error) {
      router.push("/portal")
    } else {
      setError(error.message)
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

          <Link href="/">  
            <Image
              src="/logo/cafla-logo.png"
              alt="CAFLA"
              width={180}
              height={180}
              priority
            />
          </Link>

          <h1 className="text-white text-3xl font-bold mt-4 tracking-wide">
            CAFLA
          </h1>

          <p className="text-gray-400 text-sm mt-1 text-center">
            Referee Development Platform
          </p>

        </div>


        {/* Login Card */}
        <div className="bg-[#0B0F0F]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl animate-fadeIn">

          <div className="space-y-5">

            <input
              placeholder="Email"
              className="w-full bg-[#071f1c] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#071f1c] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-red-400 text-sm text-center">
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition shadow-lg hover:shadow-emerald-500/30"
            >
              {loading ? "Signing in..." : "Login"}
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