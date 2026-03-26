export function MetricPill({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-200">{value}</p>
        </div>
    )
}