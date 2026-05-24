import {
  useEffect,
  useState,
} from "react"

import { createClient } from "@/src/lib/supabase/client"

export function useCardReasons() {

  const supabase =
    createClient()

  const [
    cardReasons,
    setCardReasons,
  ] = useState<any[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  useEffect(() => {

    async function loadReasons() {

      setLoading(true)

      const {
        data,
        error,
      } = await supabase
        .from("card_reasons")
        .select("*")

      if (error) {

        console.error(error)

        setLoading(false)

        return
      }

      setCardReasons(data || [])

      setLoading(false)
    }

    loadReasons()

  }, [])

  return {
    cardReasons,
    loading,
  }
}