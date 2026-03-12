"use client"

import { Label } from "@/src/components/ui/label"

type Option = {
  value: number
  label: string
}

type Props = {
  title: string
  value: number
  onChange: (value: number) => void
  options: Option[]
}

export function ScoreSelector({
  title,
  value,
  onChange,
  options
}: Props) {

  return (
    <div className="space-y-2">

      <Label className="font-medium">
        {title}
      </Label>

      <div className="space-y-1">

        {options.map(option => (

          <label
            key={option.value}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >

            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />

            <span>
              <strong>{option.value}</strong> — {option.label}
            </span>

          </label>

        ))}

      </div>

    </div>
  )
}