import { requireBoard } from "@/src/lib/auth/require-board"

import { getNextAttendanceSessions } from "@/src/lib/queries/get-next-attendance-session"

import { getPastAttendanceSessions } from "@/src/lib/queries/get-past-attendance-sessions"

import CreateSessionForm from "@/src/components/attendance/CreateSessionForm"

import NextAttendanceSessionCard from "@/src/components/attendance/NextAttendanceSessionCard"

import PastAttendanceSessions from "@/src/components/attendance/PastAttendanceSessions"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"

import { getUpcomingAttendanceSessions } from "@/src/lib/queries/get-upcoming-attendance-session"

import UpcomingAttendanceSessions from "@/src/components/attendance/UpcomingAttendanceSession"

import Pagination from "@/src/components/shared/pagination/Pagination"

import { getAttendanceRanking } from "@/src/lib/queries/get-attendance-ranking"

import AttendanceRankingDialog from "@/src/components/attendance/AttendanceRankingDialog"

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
  }>
}) {
  await requireBoard()

  const params =
    await searchParams

  // =========================================
  // PAGINATION
  // =========================================

  const page =
    Number(params.page ?? 0)

  const limit = 6

  // =========================================
  // DATA
  // =========================================

  const nextSession =
    await getNextAttendanceSessions()

  const upcomingSessions =
    await getUpcomingAttendanceSessions()

  const attendanceRanking =
    await getAttendanceRanking()

  const {
    data: pastSessions,
    count,
  } =
    await getPastAttendanceSessions({
      page,
      limit,
    })

  return (
    <div className="space-y-8 px-6">
      <PortalPageHeader
        title="Attendance Management"
        subtitle="Track referee participation and session performance."
      />

      {/* =====================================
          ATTENDANCE OVERVIEW
      ====================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          rounded-xl
          border
          border-white/10
          bg-[#080F0F]
          px-5
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <h2
            className="
              text-sm
              font-semibold
              text-white
            "
          >
            Referee Attendance Overview
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-400
            "
          >
            Compare referee attendance
            performance across the active
            Development cycle.
          </p>
        </div>

        <div className="shrink-0">
          <AttendanceRankingDialog
            ranking={
              attendanceRanking
            }
          />
        </div>
      </div>

      {/* =====================================
          MAIN ATTENDANCE ACTIONS
      ====================================== */}

      <div
        className="
          grid
          gap-6
          lg:grid-cols-2
        "
      >
        {/* NEXT SESSION */}

        <NextAttendanceSessionCard
          session={nextSession}
        />

        {/* CREATE SESSION */}

        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-[#080F0F]
            p-6
          "
        >
          <CreateSessionForm />
        </div>
      </div>

      {/* =====================================
          UPCOMING
      ====================================== */}

      <UpcomingAttendanceSessions
        sessions={
          upcomingSessions
        }
      />

      {/* =====================================
          PAST
      ====================================== */}

      <PastAttendanceSessions
        sessions={
          pastSessions
        }
        total={count}
        page={page}
        limit={limit}
      />

      {/* =====================================
          PAGINATION
      ====================================== */}

      <Pagination
        currentPage={page}
        totalItems={count}
        itemsPerPage={limit}
        basePath="/admin/attendance"
      />
    </div>
  )
}