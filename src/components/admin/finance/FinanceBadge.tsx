import { Badge, type BadgeProps } from "@/src/components/ui/badge"

export function FinanceBadge({ className = "", ...props }: BadgeProps) {
  const forwarded = { ...props }
  delete forwarded.variant
  return <Badge className={`border border-white/10 bg-white/[0.05] text-gray-300 ${className}`} {...forwarded} />
}
