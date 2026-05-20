import { supabaseServer } from "@/src/lib/supabase/server"

export async function getMembers(params?: {
  search?: string
  status?: string
  role?: string
  page?: number
  limit?: number
}) {

  const supabase = await supabaseServer()

  const page = params?.page ?? 0
  const limit = params?.limit ?? 10

  const from = page * limit
  const to = from + limit - 1

  let query = supabase
    .from("members")
    .select("*", {
      count: "exact",
    })

  // 🔍 SEARCH
  if (params?.search) {

    query = query.or(
      `full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
    )
  }

  // 🎛 STATUS FILTER
  if (
    params?.status &&
    params.status !== "all"
  ) {

    query = query.eq(
      "status",
      params.status
    )
  }

  // 🎛 ROLE FILTER
  if (
    params?.role &&
    params.role !== "all"
  ) {

    query = query.eq(
      "role",
      params.role
    )
  }

  const {
    data,
    error,
    count,
  } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to)

  if (error) {

    console.error(error)

    return {
      data: [],
      count: 0,
    }
  }

  return {
    data: data ?? [],
    count: count ?? 0,
  }
}