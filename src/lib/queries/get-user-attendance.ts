import { supabaseServer } from "@/src/lib/supabase/server"
import { pre } from "framer-motion/client"

export async function getUserAttendance(userId: string) {

  const supabase = await supabaseServer()

  // 🔥 FECHA ACTUAL (solo sesiones pasadas)
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("attendance_sessions")
    .select(`
      id,
      title,
      session_type,
      session_date,
      location,
      attendance_records (
        member_id,
        status
      )
    `)
    .lte("session_date", now) // ✅ solo sesiones pasadas
    .order("session_date", { ascending: false })

  if (error) {
    console.error("attendance error", error)
    throw error
  }

  // 🔥 NORMALIZAR DATA
  const sessions = (data ?? []).map((session: any) => {

    // 🔥 buscar el record del usuario
    const record = session.attendance_records.find(
      (r: any) => r.member_id === userId
    )

    let status: "present" | "late" | "excused" | "absent" = "absent"

    if (record) {
      if (record.status === "present") status = "present"
      else if (record.status === "late") status = "late"
      else if (record.status === "excused") status = "excused"
    }

    return {
      id: session.id,
      title: session.title,
      session_type: session.session_type,
      session_date: session.session_date,
      location: session.location,
      status,
    }
  })

  // 🔥 MÉTRICAS
  const total = sessions.length

  const present = sessions.filter(
    (s) => s.status === "present"
  ).length

  const late = sessions.filter(
    (s) => s.status === "late"
  ).length

  const excused = sessions.filter(
    (s) => s.status === "excused"
  ).length

  // 💡 puedes ajustar pesos aquí
  const scoreRaw =
    present * 1 +
    late * 0.5 +
    excused * 0.75

  const percentage =
    total === 0 ? 0 : Math.round((scoreRaw / total) * 100)

  return {
    sessions,
    stats: {
      total,
      present,
      late,
      excused,
      absent: total - present - late - excused,
      percentage,
    },
  }
}