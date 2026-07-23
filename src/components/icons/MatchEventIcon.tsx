import Image from "next/image"
import { RectangleVertical } from "lucide-react"

export type MatchEventIconType =
  | "goal"
  | "yellow"
  | "red"
  | "second_yellow"

type MatchEventIconProps = {
  type: MatchEventIconType
  size?: number
}

export function MatchEventIcon({
  type,
  size = 18,
}: MatchEventIconProps) {
  if (type === "goal") {
    return (
      <Image
        src="/icons/ball.png"
        alt="Goal"
        width={size}
        height={size}
        className="select-none object-contain"
      />
    )
  }

  if (type === "yellow") {
    return (
      <RectangleVertical
        size={size}
        className="fill-yellow-400 text-yellow-400"
        strokeWidth={1.8}
        aria-label="Yellow card"
      />
    )
  }

  if (type === "second_yellow") {
    return (
      <div
        className="relative shrink-0"
        style={{
          width: size + 6,
          height: size + 6,
        }}
        aria-label="Second yellow card followed by red card"
      >
        {/* Yellow (background) */}
        <RectangleVertical
          size={size}
          className="
            absolute
            left-0
            top-[3px]
            fill-yellow-400
            text-yellow-400
          "
          strokeWidth={1.8}
        />

        {/* Red (foreground) */}
        <RectangleVertical
          size={size}
          className="
            absolute
            left-[3px]
            top-0
            fill-red-500
            text-red-500
          "
          strokeWidth={1.8}
        />
      </div>
    )
  }

  return (
    <RectangleVertical
      size={size}
      className="fill-red-500 text-red-500"
      strokeWidth={1.8}
      aria-label="Red card"
    />
  )
}