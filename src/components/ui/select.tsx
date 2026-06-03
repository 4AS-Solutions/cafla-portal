"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
} from "lucide-react"

import { cn } from "@/src/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return (
    <SelectPrimitive.Root
      data-slot="select"
      {...props}
    />
  )
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn(
        "p-1",
        className
      )}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (

    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        `
          flex w-full items-center justify-between
          rounded-xl
          border border-white/10
          bg-[#071f1c]
          px-3 py-2
          text-sm text-white
          transition-all
          outline-none

          hover:border-emerald-500/30

          focus:border-emerald-500/40
          focus:ring-2
          focus:ring-emerald-500/10

          disabled:cursor-not-allowed
          disabled:opacity-50

          data-[size=default]:h-11
          data-[size=sm]:h-9
        `,
        className
      )}
      {...props}
    >
      {children}

      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          className="
            h-4 w-4
            text-gray-400
          "
        />
      </SelectPrimitive.Icon>

    </SelectPrimitive.Trigger>

  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {

  return (

    <SelectPrimitive.Portal>

      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        align={align}
        className={cn(
          `
            relative z-50
            min-w-[220px]
            overflow-hidden
            rounded-2xl

            border border-emerald-500/20

            bg-[#071f1c]/95
            backdrop-blur-xl

            text-white

            shadow-2xl
            shadow-black/40

            animate-in
            fade-in-0
            zoom-in-95
          `,
          className
        )}
        {...props}
      >

        <SelectScrollUpButton />

        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(`
            max-h-[260px]
            overflow-y-auto
            p-2

            data-[position=popper]:w-full
            data-[position=popper]:min-w-[220px]
          `)}
        >
          {children}
        </SelectPrimitive.Viewport>

        <SelectScrollDownButton />

      </SelectPrimitive.Content>

    </SelectPrimitive.Portal>

  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {

  return (

    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        `
          px-3 py-2
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-emerald-400
        `,
        className
      )}
      {...props}
    />

  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {

  return (

    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        `
          relative flex w-full
          cursor-pointer
          items-center

          rounded-xl

          px-3 py-2

          text-sm
          text-gray-200

          outline-none
          transition-all duration-150

          hover:bg-emerald-500/15
          hover:text-emerald-300

          focus:bg-emerald-500/20
          focus:text-emerald-300

          data-[state=checked]:bg-yellow-400/15
          data-[state=checked]:text-yellow-300

          data-disabled:pointer-events-none
          data-disabled:opacity-50
        `,
        className
      )}
      {...props}
    >

      <span
        className="
          absolute right-3
          flex items-center justify-center
        "
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>
        {children}
      </SelectPrimitive.ItemText>

    </SelectPrimitive.Item>

  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {

  return (

    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        `
          my-2 h-px
          bg-white/10
        `,
        className
      )}
      {...props}
    />

  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {

  return (

    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        `
          flex items-center justify-center
          py-2
          text-emerald-400
        `,
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>

  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {

  return (

    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        `
          flex items-center justify-center
          py-2
          text-emerald-400
        `,
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>

  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}