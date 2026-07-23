import {
  useEffect,
  useState,
} from "react"

import { supabase } from "@/src/lib/supabase/client"

export function useCardReasons() {
  const [cardReasons, setCardReasons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadReasons() {
      console.log("[CARD REASONS] load started")

      if (mounted) {
        setLoading(true)
      }

      let timeoutId: ReturnType<typeof setTimeout> | null = null

      try {
        console.log("[CARD REASONS] before Supabase query")

        const query = supabase
          .from("card_reasons")
          .select("*")

        const timeout = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(
              new Error(
                "Card reasons request timed out after 10 seconds."
              )
            )
          }, 10_000)
        })

        const {
          data,
          error,
        } = await Promise.race([
          Promise.resolve(query),
          timeout,
        ])

        console.log("[CARD REASONS] query resolved")

        if (error) {
          throw error
        }

        if (mounted) {
          setCardReasons(data ?? [])
        }
      } catch (error) {
        console.error(
          "[CARD REASONS] load failed:",
          error
        )

        if (mounted) {
          setCardReasons([])
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        if (mounted) {
          setLoading(false)
        }

        console.log("[CARD REASONS] load finished")
      }
    }

    void loadReasons()

    return () => {
      mounted = false
    }
  }, [])

  return {
    cardReasons,
    loading,
  }
}