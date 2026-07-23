import Image from "next/image"

type MatchRole = "cr" | "ar"

type MatchRoleIconProps = {
    role: MatchRole
    size?: number
}

export function MatchRoleIcon({
    role,
    size = 22,
}: MatchRoleIconProps) {

    const src =
        role === "cr"
            ? "/icons/whistle.png"
            : "/icons/flag.png"

    const alt =
        role === "cr"
            ? "Center Referee"
            : "Assistant Referee"

    return (
        <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            className="select-none object-contain"
        />
    )
}