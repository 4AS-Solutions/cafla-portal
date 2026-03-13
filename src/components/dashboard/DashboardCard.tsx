import { ReactNode } from "react"

export function DashboardCard({
  title,
  icon,
  children,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="portal-card portal-card-hover portal-glow min-w-0 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4 sm:px-5">

        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg
            bg-yellow-400/10 text-yellow-400
            shadow-[0_0_12px_rgba(212,169,58,0.15)]
            transition-all duration-300
            group-hover:shadow-[0_0_18px_rgba(212,169,58,0.25)]">
            {icon}
          </div>
        )}

        <h3 className="text-sm font-semibold tracking-wide text-white sm:text-base">
          {title}
        </h3>

      </div>

      {/* Content */}
      <div className="min-w-0 p-4 text-sm text-gray-300 sm:p-5">
        {children}
      </div>

    </div>
  )
}