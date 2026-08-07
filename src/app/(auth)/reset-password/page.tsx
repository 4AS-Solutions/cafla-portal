"use client"

import { useEffect, useState } from "react"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react"

import { createClient } from "@/src/lib/supabase/client"

export default function ResetPasswordPage() {
  const supabase = createClient()

  const router = useRouter()

  const [password, setPassword] =
    useState("")

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("")

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [loading, setLoading] =
    useState(false)

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true)

  const [success, setSuccess] =
    useState(false)

  const [error, setError] =
    useState("")

  useEffect(() => {
    let mounted = true

    async function validateRecoverySession() {
      try {
        const {
          data: { session },
          error,
        } =
          await supabase.auth
            .getSession()

        if (!mounted) {
          return
        }

        if (error || !session) {
          setError(
            "This password reset link is invalid or has expired."
          )
        }
      } catch (error) {
        console.error(
          "[RESET PASSWORD] Session validation failed:",
          error
        )

        if (mounted) {
          setError(
            "Unable to validate the password reset session."
          )
        }
      } finally {
        if (mounted) {
          setCheckingSession(false)
        }
      }
    }

    void validateRecoverySession()

    return () => {
      mounted = false
    }
  }, [supabase])

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (loading) {
      return
    }

    setError("")

    const passwordValidation =
        validatePassword(password)

        if (!passwordValidation.valid) {
        setError(
            passwordValidation.message
        )

        return
        }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      )

      return
    }

    setLoading(true)

    try {
      const {
        error: updateError,
      } =
        await supabase.auth
          .updateUser({
            password,
          })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)

      /*
       * End the temporary recovery
       * session after updating the password.
       */
      await supabase.auth.signOut()

      setTimeout(() => {
        router.replace("/login")
      }, 2000)
    } catch (error) {
      console.error(
        "[RESET PASSWORD] Unable to update password:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update your password."
      )
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07100E] text-gray-400">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          Validating reset link...
        </div>
      </div>
    )
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

          {success ? (
            <div className="py-3 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">
                Password updated
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Your password has been changed successfully.
              </p>

              <p className="mt-3 text-xs text-gray-500">
                Redirecting you to login...
              </p>

            </div>
          ) : (
            <>
              <div className="mb-6">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                  <LockKeyhole className="h-5 w-5 text-emerald-400" />
                </div>

                <h2 className="mt-4 text-xl font-semibold text-white">
                  Create a new password
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Choose a new password for your CAFLA account.
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* PASSWORD */}
                <div className="space-y-2">

                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-300"
                  >
                    New Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      disabled={
                        loading ||
                        Boolean(error &&
                          error.includes(
                            "invalid or has expired"
                          ))
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-white/10
                        bg-[#071f1c]
                        px-4
                        py-3
                        pr-12
                        text-white
                        outline-none
                        transition
                        focus:border-emerald-500/40
                        focus:ring-2
                        focus:ring-emerald-500/20
                        disabled:opacity-50
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-500
                        transition
                        hover:text-white
                      "
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-2">

                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-medium text-gray-300"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">

                    <input
                      id="confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={
                        confirmPassword
                      }
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      disabled={loading}
                      className="
                        w-full
                        rounded-lg
                        border
                        border-white/10
                        bg-[#071f1c]
                        px-4
                        py-3
                        pr-12
                        text-white
                        outline-none
                        transition
                        focus:border-emerald-500/40
                        focus:ring-2
                        focus:ring-emerald-500/20
                        disabled:opacity-50
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-500
                        transition
                        hover:text-white
                      "
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>

                  </div>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
                    Password requirements
                </p>

                <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <p>• At least 8 characters</p>
                    <p>• One uppercase letter</p>
                    <p>• One lowercase letter</p>
                    <p>• One number</p>
                    <p>• One symbol</p>
                </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="text-sm leading-5 text-red-300">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !password ||
                    !confirmPassword
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </button>

              </form>
            </>
          )}

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

function validatePassword(
  password: string
): {
  valid: boolean
  message: string
} {
  if (password.length < 8) {
    return {
      valid: false,
      message:
        "Password must contain at least 8 characters.",
    }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message:
        "Password must contain at least one uppercase letter.",
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message:
        "Password must contain at least one lowercase letter.",
    }
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message:
        "Password must contain at least one number.",
    }
  }

  if (
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(
      password
    )
  ) {
    return {
      valid: false,
      message:
        "Password must contain at least one symbol.",
    }
  }

  return {
    valid: true,
    message: "",
  }
}