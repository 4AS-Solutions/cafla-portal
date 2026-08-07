"use client"

import { useEffect } from "react"

import { createClient } from "@/src/lib/supabase/client"

export default function AuthCallbackPage() {
  useEffect(() => {
    async function run() {
      const supabase =
        createClient()

      const url =
        new URL(
          window.location.href
        )

      const next =
        url.searchParams.get(
          "next"
        )

      const code =
        url.searchParams.get(
          "code"
        )

      // =========================================
      // PKCE FLOW
      // =========================================

      if (code) {
        /*
        * Depending on the Supabase browser-client flow,
        * the PKCE code may already have been exchanged
        * before this effect executes.
        *
        * First check whether a valid session already exists.
        */
        let {
          data: {
            session,
          },
        } =
          await supabase.auth
            .getSession()

        if (!session) {
          const {
            data,
            error,
          } =
            await supabase.auth
              .exchangeCodeForSession(
                code
              )

          if (error) {
            console.error(
              "[AUTH CALLBACK] Unable to exchange auth code:",
              error
            )

            /*
            * Re-check once in case another
            * auth handler completed the exchange.
            */
            const {
              data: {
                session:
                  recoveredSession,
              },
            } =
              await supabase.auth
                .getSession()

            if (!recoveredSession) {
              window.location.href =
                "/login"

              return
            }

            session =
              recoveredSession
          } else {
            session =
              data.session
          }
        }

        if (!session) {
          console.error(
            "[AUTH CALLBACK] No authenticated session was established."
          )

          window.location.href =
            "/login"

          return
        }

        window.history.replaceState(
          {},
          "",
          "/auth/callback"
        )

        // =========================================
        // PASSWORD RECOVERY
        // =========================================

        if (
          next ===
          "/reset-password"
        ) {
          window.location.href =
            "/reset-password"

          return
        }

        // =========================================
        // INVITATION / ONBOARDING
        // =========================================

        window.location.href =
          "/complete-profile"

        return
      }

      // =========================================
      // LEGACY / IMPLICIT TOKEN FLOW
      // =========================================

      const hash =
        window.location.hash

      if (!hash) {
        console.error(
          "[AUTH CALLBACK] No auth code or token hash was provided."
        )

        window.location.href =
          "/login"

        return
      }

      const params =
        new URLSearchParams(
          hash.replace("#", "")
        )

      const accessToken =
        params.get(
          "access_token"
        )

      const refreshToken =
        params.get(
          "refresh_token"
        )

      const type =
        params.get("type")

      if (
        !accessToken ||
        !refreshToken
      ) {
        console.error(
          "[AUTH CALLBACK] Missing access or refresh token."
        )

        window.location.href =
          "/login"

        return
      }

      const {
        error,
      } =
        await supabase.auth
          .setSession({
            access_token:
              accessToken,

            refresh_token:
              refreshToken,
          })

      if (error) {
        console.error(
          "[AUTH CALLBACK] Unable to establish session:",
          error
        )

        window.location.href =
          "/login"

        return
      }

      window.history.replaceState(
        {},
        "",
        "/auth/callback"
      )

      // =========================================
      // PASSWORD RECOVERY
      // =========================================

      if (
        type === "recovery" ||
        next ===
          "/reset-password"
      ) {
        window.location.href =
          "/reset-password"

        return
      }

      // =========================================
      // INVITATION / ONBOARDING
      // =========================================

      window.location.href =
        "/complete-profile"
    }

    void run()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07100E] text-sm text-gray-400">
      Setting up your session...
    </div>
  )
}