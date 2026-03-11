import * as React from "react"
import { cn } from "@/src/lib/utils"

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "success" | "warning" | "danger"
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {

  const variants = {
    default:
      "bg-gray-900 text-white",

    secondary:
      "bg-gray-100 text-gray-800",

    success:
      "bg-green-100 text-green-700",

    warning:
      "bg-yellow-100 text-yellow-700",

    danger:
      "bg-red-100 text-red-700",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}