import { createClient } from "@/src/lib/supabase/server"

type CreateSessionInput = {
  title: string
  session_type: string
  session_date: string
  location?: string
  created_by: string
}

export async function createAttendanceSession(input: CreateSessionInput) {

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("attendance_sessions")
    .insert({
      title: input.title,
      session_type: input.session_type,
      session_date: input.session_date,
      location: input.location,
      created_by: input.created_by
    })
    .select()
    .single()

  if (error) {
    console.error("createAttendanceSession error:", error)
    throw error
  }

  return data
}