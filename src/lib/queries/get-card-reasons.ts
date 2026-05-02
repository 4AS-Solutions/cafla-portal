import { supabaseServer } from "@/src/lib/supabase/server"

export type CardReason = {
  code: string
  label: string
  card_type: "yellow" | "red"
}

export async function getCardReasons(): Promise<CardReason[]> {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("card_reasons")
    .select("code, label, card_type")

  if (error) {
    console.error("getCardReasons error:", error)
    return []
  }

  return data ?? []
}