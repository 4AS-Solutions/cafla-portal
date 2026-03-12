"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/lib/supabase/client"

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) {
      router.push("/portal")
    } else {
      alert(error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">

      <div className="space-y-4 w-[300px]">

        <h1 className="text-2xl font-bold text-center">
          CAFLA Portal
        </h1>

        <input
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-primary text-primary-foreground py-2 rounded"
        >
          Login
        </button>

      </div>
    </div>
  )
}