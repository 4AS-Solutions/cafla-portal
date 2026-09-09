export const CAFLA_TIME_ZONE = "America/Los_Angeles"

const dateOnlyFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: CAFLA_TIME_ZONE,
})

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: CAFLA_TIME_ZONE,
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: CAFLA_TIME_ZONE,
})

function dateOnlyAtLosAngelesNoon(value: string): Date {
  return new Date(`${value}T12:00:00Z`)
}

export function formatFinanceDate(value: string): string {
  return dateOnlyFormatter.format(dateOnlyAtLosAngelesNoon(value))
}

export function formatFinanceMonth(value: string): string {
  return monthFormatter.format(dateOnlyAtLosAngelesNoon(value))
}

export function formatFinanceDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value))
}

export function getTodayInLosAngeles(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: CAFLA_TIME_ZONE,
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return `${values.year}-${values.month}-${values.day}`
}

export function isValidMonthEnd(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return month >= 1 && month <= 12 && day === new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function monthValueToPeriodEnd(value: string): string | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) return null
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return `${match[1]}-${match[2]}-${String(day).padStart(2, "0")}`
}
