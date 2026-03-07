import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export function DashboardCard({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}