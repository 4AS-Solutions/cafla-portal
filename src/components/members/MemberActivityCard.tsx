type ActivityProps = {
  matches: number
  reports: number
  feedback: number
}

export default function MemberActivityCard({
  matches,
  reports,
  feedback,
}: ActivityProps) {
  return (
    <div className="card-pro p-6 space-y-5">

      <h2 className="section-title">Activity</h2>

      <div className="grid grid-cols-3 gap-4">

        <Stat label="Matches" value={matches} />
        <Stat label="Reports" value={reports} />
        <Stat label="Feedback" value={feedback} />

      </div>

    </div>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-white/5 border border-white/10">

      <div className="text-2xl font-bold text-emerald-400">
        {value}
      </div>

      <div className="text-xs text-muted-foreground mt-1">
        {label}
      </div>

    </div>
  )
}