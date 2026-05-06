export function calculateAttendanceScore(records: any[]) {

  if (!records.length) return 0

  let total = 0

  records.forEach((r) => {

    if (r.status === "attended") total += 1
    if (r.status === "late") total += 0.5
    if (r.status === "excused") total += 0.75
    if (r.status === "absent") total += 0

  })

  return Math.round((total / records.length) * 100)
}