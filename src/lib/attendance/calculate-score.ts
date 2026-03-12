export function calculateAttendanceScore(records: any[]) {

  if (!records.length) return 0

  let total = 0

  records.forEach((r) => {

    if (r.status === "present") total += 1
    if (r.status === "late") total += 0.5
    if (r.status === "excused") total += 0.75

  })

  return Math.round((total / records.length) * 100)
}