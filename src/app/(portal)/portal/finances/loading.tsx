export default function FinancesLoading() {
  return (
    <div className="space-y-8 pb-10" aria-label="Loading finances">
      <div className="space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
        <div className="h-9 w-44 animate-pulse rounded-xl bg-white/5" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/5" />
      </div>

      <div className="h-48 max-w-3xl animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />

      <div className="space-y-3">
        <div className="h-6 w-48 animate-pulse rounded bg-white/5" />
        <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />
      </div>

      <div className="space-y-3">
        <div className="h-6 w-64 animate-pulse rounded bg-white/5" />
        <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />
      </div>
    </div>
  )
}
