import type { ReactNode } from "react"

type CaflaEmailLayoutProps = {
    children: ReactNode
    previewText?: string
}

const CAFLA_LOGO_URL =
    "https://sugvnzymrvdfgmgchbud.supabase.co/storage/v1/object/public/images/cafla-v.png"

export function CaflaEmailLayout({
    children,
    previewText = "Official communication from CAFLA",
}: CaflaEmailLayoutProps) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />

                <title>{previewText}</title>
            </head>

            <body
                style={{
                    margin: 0,
                    padding: 0,
                    backgroundColor: "#020617",
                    fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    color: "#e2e8f0",
                }}
            >
                {/* Texto de vista previa que muestran Gmail y Outlook */}
                <div
                    style={{
                        display: "none",
                        maxHeight: 0,
                        overflow: "hidden",
                        opacity: 0,
                        color: "transparent",
                    }}
                >
                    {previewText}
                </div>

                <table
                    role="presentation"
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{
                        width: "100%",
                        padding: "40px 16px",
                        backgroundColor: "#020617",
                    }}
                >
                    <tbody>
                        <tr>
                            <td align="center">
                                <table
                                    role="presentation"
                                    width="640"
                                    cellPadding="0"
                                    cellSpacing="0"
                                    style={{
                                        width: "100%",
                                        maxWidth: "640px",
                                        backgroundColor: "#0b1513",
                                        border: "1px solid rgba(16,185,129,0.15)",
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                    }}
                                >
                                    <tbody>
                                        <tr>
                                            <td
                                                align="center"
                                                style={{
                                                    padding: "36px 32px 28px",
                                                }}
                                            >
                                                <img
                                                    src={CAFLA_LOGO_URL}
                                                    alt="CAFLA"
                                                    width="140"
                                                    style={{
                                                        display: "block",
                                                        width: "140px",
                                                        maxWidth: "100%",
                                                        height: "auto",
                                                        border: 0,
                                                    }}
                                                />
                                            </td>
                                        </tr>

                                        <tr>
                                            <td
                                                style={{
                                                    padding: "0 32px 36px",
                                                }}
                                            >
                                                {children}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <table
                                    role="presentation"
                                    width="640"
                                    cellPadding="0"
                                    cellSpacing="0"
                                    style={{
                                        width: "100%",
                                        maxWidth: "640px",
                                        marginTop: "16px",
                                    }}
                                >
                                    <tbody>
                                        <tr>
                                            <td align="center">
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: "12px",
                                                        lineHeight: "18px",
                                                        color: "#475569",
                                                    }}
                                                >
                                                    CAFLA Referee Platform
                                                </p>

                                                <p
                                                    style={{
                                                        margin: "4px 0 0",
                                                        fontSize: "11px",
                                                        lineHeight: "17px",
                                                        color: "#334155",
                                                    }}
                                                >
                                                    Colegio de Árbitros de
                                                    Fútbol de Los Ángeles
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </html>
    )
}