"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-react"

import { createClient } from "@/src/lib/supabase/client"

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [sent, setSent] =
    useState(false)

  const [error, setError] =
    useState("")

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (loading) {
      return
    }

    const normalizedEmail =
      email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError(
        "Enter your email address."
      )

      return
    }

    setLoading(true)
    setError("")

    try {
      const {
        error: resetError,
      } =
        await supabase.auth
          .resetPasswordForEmail(
            normalizedEmail,
            {
              redirectTo:
                  `${window.location.origin}/auth/callback?next=/reset-password`,
            }
          )

      if (resetError) {
        console.error(
          "[FORGOT PASSWORD] Unable to send recovery email:",
          resetError
        )

        /*
         * We intentionally avoid exposing
         * whether an account exists for
         * this email address.
         */
      }

      setSent(true)
    } catch (error) {
      console.error(
        "[FORGOT PASSWORD] Request failed:",
        error
      )

      /*
       * Keep the response neutral so
       * account existence is not exposed.
       */
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#071f1c] to-[#021312]">

      {/* BACKGROUND */}
      <div className="absolute left-[-200px] top-[-200px] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-yellow-400/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md px-6">

        {/* LOGO */}
        <div className="mb-10 flex flex-col items-center">

          <Link href="/">
            <Image
              src="/logo/cafla-logo.png"
              alt="CAFLA"
              width={160}
              height={160}
              priority
            />
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-wide text-white">
            CAFLA
          </h1>

          <p className="mt-1 text-center text-sm text-gray-400">
            Referee Development Platform
          </p>

        </div>

        {/* CARD */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-8 shadow-xl backdrop-blur-md">

          {!sent ? (
            <>
              <div className="mb-6">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                  <Mail className="h-5 w-5 text-emerald-400" />
                </div>

                <h2 className="mt-4 text-xl font-semibold text-white">
                  Forgot your password?
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Enter the email associated with your CAFLA account and we&apos;ll send you instructions to reset your password.
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="space-y-2">

                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-300"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="member@email.com"
                    disabled={loading}
                    className="
                      w-full
                      rounded-lg
                      border
                      border-white/10
                      bg-[#071f1c]
                      px-4
                      py-3
                      text-white
                      outline-none
                      transition
                      placeholder:text-gray-600
                      focus:border-emerald-500/40
                      focus:ring-2
                      focus:ring-emerald-500/20
                      disabled:opacity-60
                    "
                  />

                </div>

                {error && (
                  <p className="text-center text-sm text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !email.trim()
                  }
                  className="
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-emerald-500
                    py-3
                    font-semibold
                    text-black
                    shadow-lg
                    transition
                    hover:bg-emerald-400
                    hover:shadow-emerald-500/30
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </button>

              </form>
            </>
          ) : (
            <div className="py-2 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">
                Check your email
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                If an account exists for{" "}
                <span className="font-medium text-gray-200">
                  {email}
                </span>
                , password reset instructions have been sent.
              </p>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Check your spam or junk folder if you don&apos;t see the message.
              </p>

            </div>
          )}

          <div className="mt-6 border-t border-white/10 pt-5">

            <Link
              href="/login"
              className="
                flex
                items-center
                justify-center
                gap-2
                text-sm
                font-medium
                text-gray-400
                transition
                hover:text-white
              "
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>

          </div>

        </div>

        {/* FOOTER */}
        <p className="mt-8 text-center text-[11px] tracking-wide text-gray-500">
          © {new Date().getFullYear()} CAFLA Referee Platform

          <span className="mx-2 text-gray-700">
            •
          </span>

          <span className="text-gray-400">
            Built by
          </span>

          <span className="ml-1 font-semibold text-yellow-400/90">
            4AS SOLUTIONS
          </span>
        </p>

      </div>

    </div>
  )
}