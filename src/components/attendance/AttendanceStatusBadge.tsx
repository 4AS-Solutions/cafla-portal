import { Badge } from "@/src/components/ui/badge"

export default function AttendanceStatusBadge({ status }: { status: string }) {

  if (status === "present") {
    return <Badge className="bg-green-600/80">Present</Badge>
  }

  if (status === "late") {
    return <Badge className="bg-yellow-500/80">Late</Badge>
  }

  if (status === "excused") {
    return <Badge className="bg-blue-500/80">Excused</Badge>
  }

  return <Badge variant="danger">Absent</Badge>
}