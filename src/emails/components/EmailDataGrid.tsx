import {
    Children,
    type ReactNode,
} from "react"

type EmailDataGridProps = {
    children: ReactNode
}

export function EmailDataGrid({
    children,
}: EmailDataGridProps) {
    const items = Children.toArray(children)

    const rows: ReactNode[][] = []

    for (let index = 0; index < items.length; index += 2) {
        rows.push(items.slice(index, index + 2))
    }

    return (
        <table
            role="presentation"
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{
                width: "100%",
                borderCollapse: "collapse",
            }}
        >
            <tbody>
                {rows.map((row, index) => (
                    <tr key={index}>
                        <td
                            width="50%"
                            valign="top"
                            style={{
                                width: "50%",
                                paddingRight: "16px",
                                verticalAlign: "top",
                            }}
                        >
                            {row[0]}
                        </td>

                        <td
                            width="50%"
                            valign="top"
                            style={{
                                width: "50%",
                                paddingLeft: "16px",
                                verticalAlign: "top",
                            }}
                        >
                            {row[1] ?? null}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}