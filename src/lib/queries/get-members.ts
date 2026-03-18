import { createClient } from "@/src/lib/supabase/server"

export async function getMembers(params?: {
  search?: string
  status?: string
  role?: string
}) {
  const supabase = await createClient()

  let query = supabase.from("members").select("*")

  // 🔍 SEARCH
  if (params?.search) {
    query = query.or(
      `full_name.ilike.%${params.search}%,email.ilike.%${params.search}*`
    )
  }

  // 🎛 STATUS FILTER
  if (params?.status && params.status !== "all") {
    query = query.eq("status", params.status)
  }

  // 🎛 ROLE FILTER
  if (params?.role && params.role !== "all") {
    query = query.eq("role", params.role)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return data
}