"use client"

import { ChevronDown } from "lucide-react"

import { SelectOption } from "./filters.types"

type SelectFilterProps = {
  value?: string
  placeholder?: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export default function SelectFilter({
  value = "",
  placeholder = "Select option",
  options,
  onChange,
}: SelectFilterProps) {

  return (

    <div className="relative min-w-[200px]">

      {/* SELECT */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          h-11

          appearance-none

          rounded-2xl

          bg-black/30

          border border-white/10

          px-4
          pr-10

          text-sm text-white

          outline-none

          transition-all duration-200

          focus:border-yellow-400/30
          focus:bg-black/40
        "
      >

        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (

          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>

        ))}

      </select>

      {/* ICON */}
      <ChevronDown
        size={16}
        className="
          absolute
          right-4
          top-1/2
          -translate-y-1/2

          text-gray-500

          pointer-events-none
        "
      />

    </div>
  )
}