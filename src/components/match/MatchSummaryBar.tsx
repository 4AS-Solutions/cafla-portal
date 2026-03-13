type MatchSummaryBarProps = {
  upcomingCount: number
  pendingReportsCount: number
  submittedReportsCount: number
}

export default function MatchSummaryBar({
  upcomingCount,
  pendingReportsCount,
  submittedReportsCount,
}: MatchSummaryBarProps) {
  const items = [
    {
      label: "Upcoming Matches",
      value: upcomingCount,
    },
    {
      label: "Reports Pending",
      value: pendingReportsCount,
    },
    {
      label: "Reports Submitted",
      value: submittedReportsCount,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-[#0B0F0F]/80 p-4 backdrop-blur-md"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {item.label}
          </div>

          <div className="mt-2 text-2xl font-bold text-white">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}