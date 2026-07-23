import Image from "next/image"

type MatchStageProps = {
  label: string
  minute: number
  variant?: "default" | "highlight"
}

export function MatchStage({
  label,
  minute,
  variant = "default",
}: MatchStageProps) {
  const normalizedLabel = label.toLowerCase()

  const isKickoff = normalizedLabel === "kickoff"
  const isHalfTime = normalizedLabel === "half time"
  const isSecondHalf = normalizedLabel === "second half"
  const isFullTime = normalizedLabel === "full time"

  const isHighlighted = variant === "highlight"


  return (
    <div className="relative z-10 py-4">
      <div className="flex items-center gap-3">
        {/* LEFT DIVIDER */}
        <div
          className={`
            h-px flex-1
            ${
              isHighlighted
                ? "bg-gradient-to-r from-transparent to-[#D4A93A]/50"
                : "bg-gradient-to-r from-transparent to-white/15"
            }
          `}
        />

        {/* STAGE CONTENT */}
        <div
          className={`
            flex shrink-0 items-center gap-2
            rounded-full border
            bg-[#07130f]
            px-4 py-2
            ${
              isHighlighted
                ? "border-[#D4A93A]/45 text-[#D4A93A]"
                : "border-white/15 text-gray-200"
            }
          `}
        >

          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
            {label}
          </span>

          <span
            className={`
              border-l pl-2 text-[10px] font-medium
              ${
                isHighlighted
                  ? "border-[#D4A93A]/30 text-[#D4A93A]/75"
                  : "border-white/15 text-gray-500"
              }
            `}
          >
            {minute}'
          </span>
        </div>

        {/* RIGHT DIVIDER */}
        <div
          className={`
            h-px flex-1
            ${
              isHighlighted
                ? "bg-gradient-to-l from-transparent to-[#D4A93A]/50"
                : "bg-gradient-to-l from-transparent to-white/15"
            }
          `}
        />
      </div>
    </div>
  )
}