"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

type Member = {
  id: string
  full_name: string
}

type RefereeSelectProps = {
  value: string
  members: Member[]
  onChange: (value: string) => void
  placeholder?: string
}

export default function RefereeSelect({
  value,
  members,
  onChange,
  placeholder = "Select referee",
}: RefereeSelectProps) {

  return (

    <Select
      value={value}
      onValueChange={onChange}
    >

      <SelectTrigger
        className="
          w-full
          bg-[#071f1c]
          border border-white/10
          text-xs text-white
        "
      >

        <SelectValue
          placeholder={placeholder}
        />

      </SelectTrigger>

      <SelectContent
        position="popper"
        className="max-h-[300px] overflow-y-auto bg-[#071f1c] border border-white/10 text-white"
      >

        {members.map((m) => (

          <SelectItem
            key={m.id}
            value={m.full_name}
            className="
              text-xs
              cursor-pointer
              focus:bg-emerald-500/20
              focus:text-white
            "
          >
            {m.full_name}
          </SelectItem>

        ))}

      </SelectContent>

    </Select>
  )
}