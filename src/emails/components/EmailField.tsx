import type { CSSProperties, ReactNode } from "react"

type EmailFieldProps = {
    label: string
    value?: ReactNode
    fallback?: string
}

const wrapperStyle: CSSProperties = {
    marginBottom: "14px",
}

const labelStyle: CSSProperties = {
    margin: "0 0 4px",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: "16px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#64748b",
}

const valueStyle: CSSProperties = {
    margin: 0,
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "21px",
    color: "#e2e8f0",
    overflowWrap: "anywhere",
}

export function EmailField({
    label,
    value,
    fallback = "Not provided",
}: EmailFieldProps) {
    const hasValue =
        value !== null &&
        value !== undefined &&
        value !== ""

    return (
        <div style={wrapperStyle}>
            <p style={labelStyle}>{label}</p>

            <div style={valueStyle}>
                {hasValue ? value : fallback}
            </div>
        </div>
    )
}