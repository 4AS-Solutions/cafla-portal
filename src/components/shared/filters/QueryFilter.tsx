"use client"

import { useRouter, useSearchParams } from "next/navigation"

import FiltersContainer from "./FiltersContainer"
import SearchFilter from "./SearchFilter"
import SelectFilter from "./SelectFilter"
import DateFilter from "./DateFilter"

import { SelectOption } from "./filters.types"
import { RotateCcw } from "lucide-react"

type FilterConfig =
  | {
      type: "search"
      key: string
      placeholder?: string
    }

  | {
      type: "select"
      key: string
      placeholder?: string
      options: SelectOption[]
    }

  | {
      type: "date"
      key: string
    }

type QueryFiltersProps = {
  filters: FilterConfig[]
}

export default function QueryFilters({
  filters,
}: QueryFiltersProps) {

  const router = useRouter()

  const searchParams = useSearchParams()

  function updateParam(
    key: string,
    value: string
  ) {

    const params = new URLSearchParams(
      searchParams.toString()
    )

    // 🔥 RESET PAGE WHEN FILTER CHANGES
    params.set("page", "0")

    if (value) {

      params.set(key, value)

    } else {

      params.delete(key)

    }

    router.replace(
      `?${params.toString()}`,
      {
        scroll: false,
      }
    )
  }

  return (

    <FiltersContainer>

      {filters.map((filter) => {

        const value =
          searchParams.get(filter.key) ?? ""

        // 🔥 SEARCH
        if (filter.type === "search") {

          return (
            <SearchFilter
              key={filter.key}
              value={value}
              placeholder={filter.placeholder}
              onChange={(newValue) =>
                updateParam(
                  filter.key,
                  newValue
                )
              }
            />
          )
        }

        // 🔥 SELECT
        if (filter.type === "select") {

          return (
            <SelectFilter
              key={filter.key}
              value={value}
              placeholder={filter.placeholder}
              options={filter.options}
              onChange={(newValue) =>
                updateParam(
                  filter.key,
                  newValue
                )
              }
            />
          )
        }

        // 🔥 DATE
        return (
          <DateFilter
            key={filter.key}
            value={value}
            onChange={(newValue) =>
              updateParam(
                filter.key,
                newValue
              )
            }
          />
        )

      })}

      <button
        onClick={() => {
          router.replace("?", {
            scroll: false,
          })
        }}
        className="
          h-11

          px-4

          rounded-2xl

          bg-black/30

          border border-white/10

          flex items-center gap-2

          text-sm text-gray-300

          transition-all duration-200

          hover:border-yellow-400/30
          hover:text-white
          hover:bg-black/40
        "
      >

        <RotateCcw size={14} />

        Reset

      </button>

    </FiltersContainer>
  )
}