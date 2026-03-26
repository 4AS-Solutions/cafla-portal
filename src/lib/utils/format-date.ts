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


export function parseKickoff(dateStr: string) {
  try {
    // Ejemplo: "22/03/2026 Sun 17:15"

    const parts = dateStr.trim().split(/\s+/)

    const datePart = parts[0]
    const timePart = parts[2]

    if (!datePart || !timePart) return null

    const [day, month, year] = datePart.split("/")

    // 🔥 NO convertir a Date → evitar timezone
    return `${year}-${month}-${day} ${timePart}:00`

  } catch {
    return null
  }
}

export function formatDate(dateString: string) {

  const date = new Date(dateString)

  const day = date.getDate()
  const month = date.toLocaleString("en-US", { month: "short" }) // Mar
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")

  const ampm = hours >= 12 ? "PM" : "AM"

  hours = hours % 12
  hours = hours === 0 ? 12 : hours

  return `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`
}