type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
}

export default function PortalPageHeader({
  eyebrow,
  title,
  subtitle,
}: Props) {

  return (

    <div className="mb-6 space-y-1">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-400/90">
          {eyebrow}
        </p>
      )}

      <h1 className="text-2xl sm:text-3xl font-bold text-white">
        {title}
      </h1>

      {subtitle && (
        <p className="text-sm text-gray-400 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>

  )
}