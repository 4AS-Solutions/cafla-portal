import { requireBoard } from "@/src/lib/auth/require-board"

import { getNextAttendanceSessions } from "@/src/lib/queries/get-next-attendance-session"
import { getPastAttendanceSessions } from "@/src/lib/queries/get-past-attendance-sessions"

import CreateSessionForm from "@/src/components/attendance/CreateSessionForm"
import NextAttendanceSessionCard from "@/src/components/attendance/NextAttendanceSessionCard"
import PastAttendanceSessions from "@/src/components/attendance/PastAttendanceSessions"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { getUpcomingAttendanceSessions } from "@/src/lib/queries/get-upcoming-attendance-session"
import UpcomingAttendanceSessions from "@/src/components/attendance/UpcomingAttendanceSession"

export default async function AdminAttendancePage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {

  await requireBoard()

  const params = await searchParams;

  // 🔢 PAGINATION
  const page = Number(params.page ?? 0)
  const limit = 6

  // 📊 DATA
  const nextSession = await getNextAttendanceSessions()
  const upcomingSessions = await getUpcomingAttendanceSessions()
  const { data: pastSessions, count } = await getPastAttendanceSessions({
    page,
    limit
  })

  return (

    <div className="space-y-10 px-6">

      <PortalPageHeader 
        title="Attendance Management"
        subtitle="Track referee participation and session performance."
      />

      {/* TOP GRID */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* CREATE */}
        <div className="bg-[#080F0F] border border-white/10 rounded-2xl p-6">
          <CreateSessionForm />
        </div>

        {/* NEXT SESSION 🔥 */}
        <NextAttendanceSessionCard session={nextSession} />

      </div>

      {/* UPCOMING */}
      <UpcomingAttendanceSessions sessions={upcomingSessions} />

      {/* PAST (PAGINATED) 🔥 */}
      <PastAttendanceSessions
        sessions={pastSessions}
        total={count}
        page={page}
        limit={limit}
      />

    </div>
  )
}