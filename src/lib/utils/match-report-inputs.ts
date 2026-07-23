export function sanitizeMinute(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 2)

  if (digits === "") {
    return ""
  }

  const minute = Number(digits)

  if (minute > 90) {
    return "90"
  }

  return digits
}

export function sanitizePlayerNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 3)
}

export function sanitizePlayerName(value: string): string {
  return value
    .replace(/[^\p{L}\s'’.,-]/gu, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 60)
}