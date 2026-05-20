"use client"

import { CalendarDays } from "lucide-react"

import { SelectOption } from "./filters.types"

type DateFilterProps = {
  value?: string
  onChange: (value: string) => void
}

const options: SelectOption[] = [
  {
    label: "Last 7 Days",
    value: "7d",
  },
  {
    label: "Last 30 Days",
    value: "30d",
  },
  {
    label: "This Year",
    value: "1y",
  },
]

export default function DateFilter({
  value = "",
  onChange,
}: DateFilterProps) {

  return (

    <div className="relative min-w-[200px]">

      {/* ICON */}
      <CalendarDays
        size={16}
        className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2

          text-gray-500

          pointer-events-none
        "
      />

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

          pl-11
          pr-10

          text-sm text-white

          outline-none

          transition-all duration-200

          focus:border-yellow-400/30
          focus:bg-black/40
        "
      >

        <option value="">
          All Time
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

    </div>
  )
}