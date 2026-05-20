"use client"

import {
  useEffect,
  useState,
} from "react"

import { Search } from "lucide-react"

type SearchFilterProps = {
  value?: string
  placeholder?: string
  onChange: (value: string) => void
}

export default function SearchFilter({
  value = "",
  placeholder = "Search...",
  onChange,
}: SearchFilterProps) {

  const [inputValue, setInputValue] =
    useState(value)

  // 🔥 SYNC EXTERNAL VALUE
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // 🔥 DEBOUNCE
  useEffect(() => {

    // 🔥 AVOID LOOP AFTER RESET
    if (inputValue === value) {
      return
    }

    const timeout = setTimeout(() => {
      onChange(inputValue)
    }, 400)

    return () => clearTimeout(timeout)

  }, [inputValue, value, onChange])

  return (

    <div className="relative flex-1 min-w-[220px]">

      {/* ICON */}
      <Search
        size={16}
        className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          text-gray-500
        "
      />

      {/* INPUT */}
      <input
        type="text"
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) =>
          setInputValue(e.target.value)
        }
        className="
          w-full
          h-11

          rounded-2xl

          bg-black/30

          border border-white/10

          pl-10
          pr-4

          text-sm text-white

          outline-none

          transition-all duration-200

          placeholder:text-gray-500

          focus:border-yellow-400/30
          focus:bg-black/40
        "
      />

    </div>
  )
}