const LOS_ANGELES_TIME_ZONE =
  "America/Los_Angeles"

/**
 * Convierte un valor de datetime-local, por ejemplo:
 *
 * 2026-08-07T19:30
 *
 * interpretándolo como hora local de Los Ángeles y
 * devolviendo un ISO UTC válido:
 *
 * 2026-08-08T02:30:00.000Z
 *
 * Funciona tanto con PDT (-07:00) como PST (-08:00).
 */
export function localLosAngelesDateTimeToUTC(
  value: string
): string {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  )

  if (!match) {
    throw new Error(
      "Invalid local date and time format."
    )
  }

  const [, year, month, day, hour, minute] =
    match

  const desiredParts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  }

  /*
   * Empezamos asumiendo que las partes representan UTC.
   * Después calculamos la diferencia real con Los Ángeles.
   */
  let timestamp = Date.UTC(
    desiredParts.year,
    desiredParts.month - 1,
    desiredParts.day,
    desiredParts.hour,
    desiredParts.minute,
    0,
    0
  )

  /*
   * Dos iteraciones resuelven correctamente el offset,
   * incluso cerca de cambios de horario de verano.
   */
  for (let attempt = 0; attempt < 2; attempt++) {
    const actualParts =
      getDatePartsInTimeZone(
        new Date(timestamp),
        LOS_ANGELES_TIME_ZONE
      )

    const desiredAsUTC = Date.UTC(
      desiredParts.year,
      desiredParts.month - 1,
      desiredParts.day,
      desiredParts.hour,
      desiredParts.minute
    )

    const actualAsUTC = Date.UTC(
      actualParts.year,
      actualParts.month - 1,
      actualParts.day,
      actualParts.hour,
      actualParts.minute
    )

    timestamp += desiredAsUTC - actualAsUTC
  }

  const result = new Date(timestamp)

  if (Number.isNaN(result.getTime())) {
    throw new Error(
      "Unable to process the selected date."
    )
  }

  return result.toISOString()
}

function getDatePartsInTimeZone(
  date: Date,
  timeZone: string
) {
  const formatter =
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })

  const parts = formatter.formatToParts(date)

  const getPart = (type: string) =>
    Number(
      parts.find(
        (part) => part.type === type
      )?.value
    )

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
  }
}

/**
 * Para fechas nuevas guardadas como timestamptz,
 * new Date() es suficiente.
 *
 * La compatibilidad adicional interpreta fechas legacy
 * sin offset como hora de Los Ángeles.
 */
export function parseLocalDate(
  dateString: string
) {
  if (!dateString) {
    return new Date()
  }

  const hasExplicitTimeZone =
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(
      dateString
    )

  if (hasExplicitTimeZone) {
    return new Date(dateString)
  }

  const normalized = dateString
    .trim()
    .replace(" ", "T")
    .slice(0, 16)

  return new Date(
    localLosAngelesDateTimeToUTC(normalized)
  )
}

export function formatFullDate(
  dateString: string
) {
  const date = parseLocalDate(dateString)

  return date.toLocaleDateString("en-US", {
    timeZone: LOS_ANGELES_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export function formatSessionTime(
  dateString: string
) {
  const date = parseLocalDate(dateString)

  return date.toLocaleTimeString("en-US", {
    timeZone: LOS_ANGELES_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  })
}

export function getAddress(session: any) {
  if (session.location === "CAFLA") {
    return "5914 E. Washington Blvd, Commerce, CA 90040"
  }

  if (
    session.location === "Rosewood Park"
  ) {
    return "5600 Harbor St, Commerce, CA 90040"
  }

  return (
    session.address ||
    "Location details provided in session"
  )
}

export function getUniformSet(
  session: any
) {
  const date = parseLocalDate(
    session?.session_date
  )

  const day = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: LOS_ANGELES_TIME_ZONE,
      weekday: "short",
    })
      .formatToParts(date)
      .find(
        (part) =>
          part.type === "weekday"
      )?.value === "Mon"
      ? 1
      : new Intl.DateTimeFormat(
          "en-US",
          {
            timeZone:
              LOS_ANGELES_TIME_ZONE,
            weekday: "short",
          }
        ).format(date) === "Wed"
        ? 3
        : new Intl.DateTimeFormat(
            "en-US",
            {
              timeZone:
                LOS_ANGELES_TIME_ZONE,
              weekday: "short",
            }
          ).format(date) === "Fri"
          ? 5
          : -1
  )

  if (day === 1) {
    return [
      "/images/uniforms/monday-shirt.png",
      "/images/uniforms/short-training.png",
    ]
  }

  if (day === 3) {
    return [
      "/images/uniforms/thursday-shirt.png",
      "/images/uniforms/short-training.png",
    ]
  }

  return [
    "/images/uniforms/friday-jacket.png",
    "/images/uniforms/friday-shirt.png",
    "/images/uniforms/friday-pants.png",
    "/images/uniforms/friday-short.png",
    "/images/uniforms/friday-sweater.png",
  ]
}

export function getUpcomingSessions(
  sessionsRaw: any[]
) {
  const now = new Date()

  return sessionsRaw
    .filter(
      (session: any) =>
        session?.session_date
    )
    .map((session: any) => ({
      ...session,
      dateObj: parseLocalDate(
        session.session_date
      ),
    }))
    .filter(
      (session: any) =>
        session.dateObj.getTime() +
          15 * 60 * 1000 >=
        now.getTime()
    )
    .sort(
      (a: any, b: any) =>
        a.dateObj.getTime() -
        b.dateObj.getTime()
    )
}

export function getNextSession(
  sessionsRaw: any[]
) {
  const sessions =
    getUpcomingSessions(sessionsRaw)

  return sessions[0] || null
}

/**
 * Conservado temporalmente por compatibilidad.
 *
 * Ahora devuelve el instante UTC real, sin construir
 * manualmente un offset fijo de Los Ángeles.
 */
export function getPacificISOString() {
  return new Date().toISOString()
}