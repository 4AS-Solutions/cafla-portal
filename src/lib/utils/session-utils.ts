export function parseLocalDate(dateString: string) {
  if (!dateString) return new Date()

  const fixed = dateString.replace(" ", "T") + "-07:00"

  return new Date(fixed)
}

export function formatFullDate(dateString: string) {
  const date = parseLocalDate(dateString)

  return date.toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export function formatSessionTime(dateString: string) {
  const date = parseLocalDate(dateString)

  return date.toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getAddress(session: any) {
  if (session.location === "CAFLA") {
    return "5914 E. Washington Blvd, Commerce, CA 90040"
  }

  if (session.location === "Rosewood Park") {
    return "5600 Harbor St, Commerce, CA 90040"
  }

  return session.address || "Location details provided in session"
}

export function getUniformSet(session: any) {
  const date = parseLocalDate(session?.session_date)

  const day = new Date(
    date.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    })
  ).getDay()

  if (day === 1) {
    return [
      "/images/uniforms/monday-shirt.png",
      "/images/uniforms/short-training.png",
    ]
  }

  if (day === 4) {
    return [
      "/images/uniforms/thursday-shirt.png",
      "/images/uniforms/short-training.png",
    ]
  }

  if (day === 5) {
    return [
      "/images/uniforms/friday-jacket.png",
      "/images/uniforms/friday-shirt.png",
      "/images/uniforms/friday-pants.png",
      "/images/uniforms/friday-short.png",
      "/images/uniforms/friday-sweater.png",
    ]
  }

  return ["/images/uniforms/short-training.png"]
}

export function getUpcomingSessions(sessionsRaw: any[]) {
  const now = new Date()

  return sessionsRaw
    .filter((s: any) => s?.session_date)
    .map((s: any) => ({
      ...s,
      dateObj: parseLocalDate(s.session_date),
    }))
    .filter(
      (s: any) =>
        s.dateObj.getTime() + 15 * 60 * 1000 >= now.getTime()
    )
    .sort(
      (a: any, b: any) =>
        a.dateObj.getTime() - b.dateObj.getTime()
    )
}

export function getNextSession(sessionsRaw: any[]) {
  const sessions = getUpcomingSessions(sessionsRaw)

  return sessions[0] || null
}

export function getPacificISOString() {
  const now = new Date()

  const pacific = new Date(
    now.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    })
  )

  const year = pacific.getFullYear()
  const month = String(pacific.getMonth() + 1).padStart(2, "0")
  const day = String(pacific.getDate()).padStart(2, "0")
  const hours = String(pacific.getHours()).padStart(2, "0")
  const minutes = String(pacific.getMinutes()).padStart(2, "0")
  const seconds = String(pacific.getSeconds()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-07:00`
}