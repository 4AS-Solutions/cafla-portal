import {
  CheckCircle2,
  Circle,
  Clock3,
  RotateCcw,
} from "lucide-react"

import { Badge } from "../../ui/badge"

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"

const statusConfig = {
  pending: {
    variant: "warning" as BadgeVariant,
    label: "Pending",
    icon: Clock3,
  },

  submitted: {
    variant: "secondary" as BadgeVariant,
    label: "Awaiting Review",
    icon: Circle,
  },

  approved: {
    variant: "success" as BadgeVariant,
    label: "Approved",
    icon: CheckCircle2,
  },

  revision_required: {
    variant: "danger" as BadgeVariant,
    label: "Revision Requested",
    icon: RotateCcw,
  },
}

export default function StatusBadge({
  status,
}: {
  status: string
}) {
  const config =
    statusConfig[
      status as keyof typeof statusConfig
    ] ?? {
      variant: "default" as BadgeVariant,
      label: status,
      icon: Circle,
    }

  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className="gap-1.5"
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </Badge>
  )
}