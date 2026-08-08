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
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* EMAIL PREVIEW TEXT */}
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

        {/* OUTER CANVAS
            Do not force a background color.
            Let Gmail / Outlook / Apple Mail
            handle the user's light/dark mode.
        */}
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{
            width: "100%",
            padding: "32px 12px",
          }}
        >
          <tbody>
            <tr>
              <td align="center">

                {/* CAFLA CARD */}
                <table
                  role="presentation"
                  width="640"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    width: "100%",
                    maxWidth: "640px",
                    backgroundColor: "#0b1513",
                    border: "1px solid #16332d",
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  <tbody>

                    {/* LOGO */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding:
                            "36px 32px 28px",
                        }}
                      >
                        <img
                          src={
                            CAFLA_LOGO_URL
                          }
                          alt="CAFLA"
                          width="140"
                          style={{
                            display:
                              "block",
                            width:
                              "140px",
                            maxWidth:
                              "100%",
                            height:
                              "auto",
                            border: 0,
                          }}
                        />
                      </td>
                    </tr>

                    {/* CONTENT */}
                    <tr>
                      <td
                        style={{
                          padding:
                            "0 32px 36px",
                        }}
                      >
                        {children}
                      </td>
                    </tr>

                  </tbody>
                </table>

                {/* OUTER FOOTER */}
                <table
                  role="presentation"
                  width="640"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    width: "100%",
                    maxWidth: "640px",
                    marginTop: "14px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td align="center">

                        <p
                          style={{
                            margin: 0,
                            fontSize:
                              "12px",
                            lineHeight:
                              "18px",
                            color:
                              "#64748b",
                          }}
                        >
                          CAFLA Referee Platform
                        </p>

                        <p
                          style={{
                            margin:
                              "4px 0 0",
                            fontSize:
                              "11px",
                            lineHeight:
                              "17px",
                            color:
                              "#64748b",
                          }}
                        >
                          Colegio de Árbitros de Fútbol de Los Ángeles
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