import type { CSSProperties, ReactNode } from "react"

type EmailSectionProps = {
    title: string
    children: ReactNode
}

const titleStyle: CSSProperties = {
    margin: "0 0 16px",
    paddingBottom: "8px",
    borderBottom: "1px solid rgba(16,185,129,0.20)",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#34d399",
}

const contentStyle: CSSProperties = {
    fontSize: "14px",
    lineHeight: 1.65,
    color: "#cbd5e1",
}

export function EmailSection({
    title,
    children,
}: EmailSectionProps) {
    return (
        <section
            style={{
                marginBottom: "32px",
            }}
        >
            <h2 style={titleStyle}>
                {title}
            </h2>

            <div style={contentStyle}>
                {children}
            </div>
        </section>
    )
}