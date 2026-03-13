import { cn } from "@/src/lib/utils"
import * as React from "react"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        `
        group/card flex flex-col overflow-hidden rounded-2xl
        border border-white/10 bg-[#0B0F0F]/70 backdrop-blur-md
        text-sm text-gray-300 shadow-lg
        transition-all duration-300
        hover:border-yellow-400/20
        hover:shadow-emerald-500/10
        gap-5 py-5
        data-[size=sm]:gap-4 data-[size=sm]:py-4
        `,
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        `
        grid auto-rows-min items-start gap-1
        border-b border-white/10 px-5 pb-4
        group-data-[size=sm]/card:px-4
        `,
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base font-semibold tracking-wide text-white", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-gray-400", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("absolute right-4 top-4", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        `
        flex items-center border-t border-white/10
        px-5 pt-4
        group-data-[size=sm]/card:px-4
        `,
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}