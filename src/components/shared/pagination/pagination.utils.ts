export function getTotalPages(
  totalItems: number,
  itemsPerPage: number
) {
  return Math.max(
    1,
    Math.ceil(totalItems / itemsPerPage)
  )
}

export function generatePagination(
  currentPage: number,
  totalPages: number
) {

  const pages: (number | "...")[] = []

  // 🔥 SMALL TOTAL
  if (totalPages <= 7) {

    for (let i = 0; i < totalPages; i++) {
      pages.push(i)
    }

    return pages
  }

  // 🔥 START RANGE
  if (currentPage <= 3) {

    pages.push(0, 1, 2, 3, 4, "...", totalPages - 1)

    return pages
  }

  // 🔥 END RANGE
  if (currentPage >= totalPages - 4) {

    pages.push(
      0,
      "...",
      totalPages - 5,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1
    )

    return pages
  }

  // 🔥 MIDDLE RANGE
  pages.push(
    0,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages - 1
  )

  return pages
}