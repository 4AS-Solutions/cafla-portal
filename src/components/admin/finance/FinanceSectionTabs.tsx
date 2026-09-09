import Link from "next/link"

const sections = [
  { value: "balances", label: "Balances" },
  { value: "transactions", label: "Transactions" },
  { value: "closings", label: "Monthly Closings" },
] as const

export function FinanceSectionTabs({ active }: { active: string }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-1">
      {sections.map((section) => (
        <Link
          key={section.value}
          href={`/admin/finance?section=${section.value}`}
          className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            active === section.value
              ? "bg-yellow-400/15 text-yellow-300 ring-1 ring-yellow-400/20"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          {section.label}
        </Link>
      ))}
    </div>
  )
}
