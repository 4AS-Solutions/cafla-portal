type Props = {
  value: string
  onChange: (v: string) => void
}

export default function MatchesSearch({ value, onChange }: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search matches..."
      className="
        w-full md:w-80
        bg-[#0B0F0F]
        border border-white/10
        rounded-lg
        px-3 py-2
        text-sm text-white
        focus:outline-none
        focus:border-emerald-500/40
      "
    />
  )
}