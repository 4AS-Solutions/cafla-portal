"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  generatePagination,
  getTotalPages,
} from "./pagination.utils"

import { PaginationProps } from "./pagination.types"

type Props = PaginationProps & {
  basePath: string
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
}: Props) {

  const router = useRouter()

  const searchParams = useSearchParams()

  const totalPages = getTotalPages(
    totalItems,
    itemsPerPage
  )

  // 🔥 RESPONSIVE DETECTION
  const [isMobile, setIsMobile] = useState(false)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {

    setMounted(true)

    function handleResize() {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }

  }, [])

  // 🔥 NO PAGINATION NEEDED
  if (totalPages <= 1) {
    return null
  }

  const pages = generatePagination(
    currentPage,
    totalPages
  )

  function goToPage(page: number) {

    const params = new URLSearchParams(
      searchParams.toString()
    )

    params.set("page", page.toString())

    router.replace(
      `?${params.toString()}`,
      {
        scroll: false,
      }
    )
  }

  const baseButtonStyles =
    `
      min-w-[42px]
      h-11
      px-4

      rounded-2xl

      text-sm
      font-medium

      flex items-center justify-center

      transition-all duration-200

      backdrop-blur-md

      shadow-[0_0_0_1px_rgba(255,255,255,0.04)]

      hover:scale-[1.03]
      active:scale-[0.98]
    `

  const inactiveStyles =
    `
      bg-white/[0.03]
      text-gray-300

      hover:bg-white/[0.06]
      hover:text-white

      shadow-[0_4px_20px_rgba(0,0,0,0.25)]
    `

  const activeStyles =
    `
      bg-gradient-to-b
      from-yellow-500/20
      to-yellow-500/5

      text-yellow-200

      shadow-[0_0_0_1px_rgba(250,204,21,0.25),0_0_20px_rgba(250,204,21,0.08)]

      hover:from-yellow-500/25
      hover:to-yellow-500/10
    `

  // =====================================================
  // 🔥 MOBILE VERSION
  // =====================================================

  if (isMobile) {

    return (

      <div className="flex items-center justify-center gap-3 pt-6">

        {/* PREVIOUS */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          className={`
            ${baseButtonStyles}
            ${inactiveStyles}

            disabled:opacity-40
            disabled:pointer-events-none
          `}
        >
          {"<"}
        </button>

        {/* PAGE INFO */}
        <div
          className="
            h-11
            px-5

            rounded-2xl

            flex items-center justify-center

            bg-white/[0.03]

            text-sm text-gray-300

            shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
          "
        >
          Page {currentPage + 1} of {totalPages}
        </div>

        {/* NEXT */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={`
            ${baseButtonStyles}
            ${inactiveStyles}

            disabled:opacity-40
            disabled:pointer-events-none
          `}
        >
          {">"}
        </button>

      </div>
    )
  }

  // =====================================================
  // 🔥 DESKTOP VERSION
  // =====================================================

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-6">

      {/* FIRST */}
      <button
        onClick={() => goToPage(0)}
        disabled={currentPage === 0}
        className={`
          ${baseButtonStyles}
          ${inactiveStyles}

          disabled:opacity-40
          disabled:pointer-events-none
        `}
      >
        {"<<"}
      </button>

      {/* PREVIOUS */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 0}
        className={`
          ${baseButtonStyles}
          ${inactiveStyles}

          disabled:opacity-40
          disabled:pointer-events-none
        `}
      >
        {"<"}
      </button>

      {/* PAGES */}
      {pages.map((page, index) => {

        if (page === "...") {

          return (
            <div
              key={`ellipsis-${index}`}
              className="px-2 text-gray-500"
            >
              ...
            </div>
          )
        }

        const isActive = page === currentPage

        return (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`
              ${baseButtonStyles}

              ${
                isActive
                  ? activeStyles
                  : inactiveStyles
              }
            `}
          >
            {page + 1}
          </button>
        )
      })}

      {/* NEXT */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className={`
          ${baseButtonStyles}
          ${inactiveStyles}

          disabled:opacity-40
          disabled:pointer-events-none
        `}
      >
        {">"}
      </button>

      {/* LAST */}
      <button
        onClick={() => goToPage(totalPages - 1)}
        disabled={currentPage >= totalPages - 1}
        className={`
          ${baseButtonStyles}
          ${inactiveStyles}

          disabled:opacity-40
          disabled:pointer-events-none
        `}
      >
        {">>"}
      </button>

    </div>
  )
}