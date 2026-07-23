import Image from "next/image"
import { RectangleVertical } from "lucide-react"

type MatchEventIconProps = {
  type: "goal" | "yellow" | "red"
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

  return (
    <RectangleVertical
      size={size}
      className="fill-red-500 text-red-500"
      strokeWidth={1.8}
      aria-label="Red card"
    />
  )
}