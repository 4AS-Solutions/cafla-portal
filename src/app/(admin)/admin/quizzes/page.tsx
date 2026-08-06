import Link from "next/link"
import {
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  FileQuestion,
  Plus,
} from "lucide-react"

import { requireBoard } from "@/src/lib/auth/require-board"
import { getAdminQuizzes } from "@/src/lib/queries/get-quizzes-admin"

import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import AdminQuizList from "@/src/components/admin/quizzes/QuizList"

export default async function AdminQuizzesPage() {
  await requireBoard()

  const dashboard =
    await getAdminQuizzes()

  return (
    <div className="space-y-8 px-3 pb-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PortalPageHeader
          title="Quiz Management"
          subtitle="Create, publish, and analyze referee knowledge assessments."
        />

        <Link
          href="/admin/quizzes/new"
          className="
            inline-flex
            min-h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-500
            px-5
            text-sm
            font-semibold
            text-black
            transition
            hover:bg-emerald-400
            sm:w-auto
          "
        >
          <Plus className="h-4 w-4" />
          Create Assessment
        </Link>
      </div>

      {dashboard.cycle ? (
        <>
          <div className="rounded-xl border border-white/10 bg-[#0B0F0F]/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
              Active development cycle
            </p>

            <p className="mt-1 font-semibold text-white">
              {dashboard.cycle.name}
            </p>
          </div>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <DashboardMetric
              label="Assessments"
              value={dashboard.summary.total}
              helper={`${dashboard.summary.available} available`}
              icon={
                <BookOpenCheck className="h-5 w-5 text-yellow-300" />
              }
            />

            <DashboardMetric
              label="Attempts"
              value={
                dashboard.summary
                  .totalAttempts
              }
              helper={`${dashboard.summary.completedAttempts} completed`}
              icon={
                <FileQuestion className="h-5 w-5 text-sky-300" />
              }
            />

            <DashboardMetric
              label="Average score"
              value={
                dashboard.summary
                  .averageScore === null
                  ? "—"
                  : `${dashboard.summary.averageScore}%`
              }
              helper="Completed attempts"
              icon={
                <BarChart3 className="h-5 w-5 text-emerald-300" />
              }
            />

            <DashboardMetric
              label="Published"
              value={
                dashboard.summary
                  .available +
                dashboard.summary
                  .upcoming +
                dashboard.summary.closed
              }
              helper={`${dashboard.summary.draft} drafts`}
              icon={
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              }
            />
          </section>

          <AdminQuizList
            quizzes={
              dashboard.assessments
            }
          />
        </>
      ) : (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-8 text-center">
          <p className="font-semibold text-amber-100">
            No active development cycle
          </p>

          <p className="mt-2 text-sm text-amber-100/70">
            An active cycle is required before creating assessments.
          </p>
        </div>
      )}
    </div>
  )
}

function DashboardMetric({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: number | string
  helper: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0F0F]/90 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          {icon}
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {helper}
      </p>
    </div>
  )
}