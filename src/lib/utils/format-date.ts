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

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", // 🔥 CLAVE: fija timezone
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const formatted = formatter.format(date)

  // mantiene tu formato visual con el punto
  return formatted.replace(/,([^,]+)$/, " • $1")
}