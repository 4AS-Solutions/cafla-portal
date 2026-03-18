import { getMemberById } from "@/src/lib/queries/get-member-by-id"
import PortalPageHeader from "@/src/components/layout/PortalPageHeader"
import { Badge } from "@/src/components/ui/badge"
import { formatMatchDate } from "@/src/lib/utils/format-date"
import { getMemberDashboard } from "@/src/lib/queries/get-member-dashboard"
import MemberActivityCard from "@/src/components/members/MemberActivityCard"

export default async function MemberPage({
  params,
}: {
  params: Promise<{ member_id: string }>
}) {

  const { member_id } = await params
  const member = await getMemberById(member_id)
  const dashboard = await getMemberDashboard(member_id);
  const score = dashboard.development.development_score ?? 0

  if (!member) {
    return <div>Member not found</div>
  }

  const initials = member.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)


  return (

    <div className="max-w-6xl mx-auto space-y-8">

      {/* ================= HEADER ================= */}

      <div className="card-pro p-6 flex items-center gap-4">

        {/* AVATAR */}
        <div className="
          w-14 h-14 rounded-full
          bg-emerald-900/40
          flex items-center justify-center
          text-lg font-bold
        ">
          {initials}
        </div>

        {/* INFO */}
        <div className="flex-1">

          <div className="flex items-center gap-2 flex-wrap">

            <h1 className="text-xl font-semibold">
              {member.full_name}
            </h1>

            {member.role === "board" ? (
              <Badge className="bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
                BOARD
              </Badge>
            ) : (
              <Badge variant="secondary">MEMBER</Badge>
            )}

            {member.status === "active" && (
              <Badge variant="success">{member.status.toUpperCase()}</Badge>
            )}

            {member.status === "invited" && (
              <Badge variant="warning">{member.status.toUpperCase()}</Badge>
            )}

            {member.status === "inactive" && (
              <Badge variant="danger">{member.status.toUpperCase()}</Badge>
            )}

          </div>

          <div className="text-sm text-muted-foreground">
            {member.email.toLowerCase()}
          </div>

        </div>

      </div>

      {/* ================= MAIN GRID ================= */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* PERSONAL */}
          <div className="card-pro p-6 space-y-4">

            <h2 className="section-title">Personal Info</h2>

            <div className="grid sm:grid-cols-2 gap-6 text-sm">

              <Info label="Email" value={member.email.toLowerCase()} />
              <Info label="Phone" value={member.phone ?? "-"} />
              <Info label="Joined" value={formatMatchDate(member.created_at)} />

            </div>

          </div>

          {/* REFEREE PROFILE */}
          <div className="card-pro p-6 space-y-4">

            <h2 className="section-title">Referee Profile</h2>

            <div className="grid sm:grid-cols-2 gap-6 text-sm">

              <Info label="Grade" value={member.grade ?? "Grassroot"} />
              <Info label="Category" value={member.category ?? "N/A"} />
              <Info label="USSF ID" value={member.ussf_id ?? "N/A"} />
              <Info label="Years in CAFLA" value={member.years_in_cafla ?? "0"} />

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* PERFORMANCE SCORE */}
          <div className="card-pro p-6 space-y-4">

            <h2 className="section-title">
              Overall Performance
            </h2>

            <div className="text-3xl font-bold">
              {score} %
            </div>

            {/* BAR */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${score}%` }} />
            </div>

            <div className="text-xs text-muted-foreground">
              Based on feedback, attendance, reports and quizzes
            </div>

          </div>

          {/* METRICS */}
          <div className="card-pro p-5 space-y-4">

            <Metric label="Attendance" value={`${dashboard.development?.attendance_score ?? 0}%`} />
            <Metric label="Quiz Avg" value={`${dashboard.quiz?.avg_quiz_score ?? 0}%`} />
            <Metric label="Feedback" value={dashboard.development?.peer_feedback_score ?? 0} />
            <Metric label="Reports" value={dashboard.reports?.report_score ?? 0} />

          </div>

          {/* ACTIVITY */}
          <MemberActivityCard
            matches={dashboard.activity?.matches_officiated ?? 0}
            reports={dashboard.activity?.reports_submitted ?? 0}
            feedback={dashboard.activity?.evaluations_received ?? 0}
          /> 

        </div>

      </div>

    </div>

  )
}

/* ================= COMPONENTS ================= */

function Info({ label, value }: { label: string, value: any }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">
        {label}
      </div>
      <div className="font-medium">
        {value}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string, value: any }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}