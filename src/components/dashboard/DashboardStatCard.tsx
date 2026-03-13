import { ReactNode } from "react"

type Props = {
  label: string
  value: string | number
  icon?: ReactNode
}

export function DashboardStatCard({ label, value, icon }: Props) {
  return (
    <div className="portal-card portal-card-hover flex items-center gap-4 p-4">

      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400">
          {icon}
        </div>
      )}

      <div className="leading-tight">
        <div className="text-xs uppercase tracking-wide text-gray-400">
          {label}
        </div>

        <div className="text-xl font-semibold text-white">
          {value}
        </div>
      </div>

    </div>
  )
}