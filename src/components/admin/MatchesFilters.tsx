type Props = {
  status: string
  onChange: (v: string) => void
}

export default function MatchesFilters({ status, onChange }: Props) {

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      className="
        bg-[#0B0F0F]
        border border-white/10
        rounded-lg
        px-3 py-2
        text-sm text-white
      "
    >
      <option value="all">All Status</option>
      <option value="pending">Pending</option>
      <option value="submitted">Submitted</option>
      <option value="approved">Approved</option>
    </select>
  )
}