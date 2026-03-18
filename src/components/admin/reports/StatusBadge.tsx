import { Badge } from "../../ui/badge"

export default function StatusBadge({ status }: { status: string }) {

  const styles: Record<string, string> = {
    pending: "warning",
    submitted: "secondary",
    approved: "success",
    revision_required: "danger",
  }

  return (
    <Badge variant={styles[status]}>
      {status.replace("_", " ")}
    </Badge>
  )
}