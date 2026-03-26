import { Badge } from "../../ui/badge"

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"

const styles: Record<string, BadgeVariant> = {
  pending: "warning",
  submitted: "secondary",
  approved: "success",
  revision_required: "danger",
}

export default function StatusBadge({ status }: { status: string }) {
  const variant = styles[status] ?? "default" // 🔥 fallback seguro

  return (
    <Badge variant={variant}>
      {status.replace("_", " ")}
    </Badge>
  )
}