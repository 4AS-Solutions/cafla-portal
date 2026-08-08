import { getSessionAttendance } from "@/src/lib/queries/get-session-attendance"

export async function getSessionAttendanceList(
  sessionId: string
) {
  const attendance =
    await getSessionAttendance(
      sessionId
    )

  return attendance.members.map(
    (member) => ({
      member_id: member.id,
      name: member.full_name,

      status:
        attendance.statusMap[
          member.id
        ] ?? "absent",
    })
  )
}