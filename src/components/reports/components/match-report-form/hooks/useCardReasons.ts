import { useEffect, useState } from "react"

import { createClient } from "@/src/lib/supabase/client"

export function useCardReasons() {
  const supabase = createClient()

  const [cardReasons, setCardReasons] = useState<any[]>([])

  useEffect(() => {
    async function loadReasons() {
      const { data, error } = await supabase
        .from("card_reasons")
        .select("*")

      if (error) {
        console.error(error)
        return
      }

      setCardReasons(data || [])
    }

    loadReasons()
  }, [])

  return {
    cardReasons,
  }
}