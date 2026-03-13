export function formatMatchDate(dateString: string | null) {
  if (!dateString) return "Date pending"

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return "Date pending"
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}