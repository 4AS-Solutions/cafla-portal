import { createHash } from "node:crypto"
import * as XLSX from "xlsx"

import { buildArbiterFeeAssignmentKey, getArbiterFeeAmounts } from "./rules"
import type {
  ArbiterFeeParseIssue,
  ArbiterFeeParseResult,
  ArbiterFeeParsedAssignment,
  ArbiterFeeParsedMatch,
  ArbiterFeeRole,
} from "./types"

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_DATA_ROWS = 10_000

const COLUMNS = {
  gameId: 0,
  date: 1,
  day: 2,
  time: 3,
  sport: 4,
  division: 5,
  league: 7,
  site: 8,
  home: 9,
  away: 10,
  comments: 11,
  center: 12,
  ar1: 13,
  ar2: 14,
} as const

type WorksheetCell = XLSX.CellObject | undefined

function cellAt(sheet: XLSX.WorkSheet, row: number, column: number): WorksheetCell {
  return sheet[XLSX.utils.encode_cell({ r: row, c: column })]
}

function cellText(cell: WorksheetCell): string {
  if (!cell || cell.v === null || cell.v === undefined) return ""
  if (cell.v instanceof Date) return cell.v.toISOString()
  return String(cell.w ?? cell.v).trim()
}

function isoDate(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function parseDateCell(cell: WorksheetCell): string | null {
  if (!cell) return null
  if (cell.v instanceof Date) return isoDate(cell.v.getUTCFullYear(), cell.v.getUTCMonth() + 1, cell.v.getUTCDate())
  if (typeof cell.v === "number") {
    const parsed = XLSX.SSF.parse_date_code(cell.v)
    return parsed ? isoDate(parsed.y, parsed.m, parsed.d) : null
  }
  const text = cellText(cell)
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(text)
  if (iso) return isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
  const dayFirst = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/.exec(text)
  return dayFirst ? isoDate(Number(dayFirst[3]), Number(dayFirst[2]), Number(dayFirst[1])) : null
}

function parseTimeCell(cell: WorksheetCell): string | null {
  if (!cell) return null
  if (cell.v instanceof Date) return `${String(cell.v.getUTCHours()).padStart(2, "0")}:${String(cell.v.getUTCMinutes()).padStart(2, "0")}`
  if (typeof cell.v === "number") {
    const totalMinutes = Math.round((cell.v % 1) * 24 * 60)
    return `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`
  }
  const text = cellText(cell)
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i.exec(text)
  if (!match) return null
  let hour = Number(match[1])
  const minute = Number(match[2])
  const meridiem = match[3]?.toUpperCase()
  if (minute > 59 || hour > (meridiem ? 12 : 23) || hour < (meridiem ? 1 : 0)) return null
  if (meridiem === "AM" && hour === 12) hour = 0
  if (meridiem === "PM" && hour !== 12) hour += 12
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function hasFormula(sheet: XLSX.WorkSheet, row: number): boolean {
  return Object.values(COLUMNS).some((column) => Boolean(cellAt(sheet, row, column)?.f))
}

export function parseArbiterFeeFile(fileBuffer: ArrayBuffer, originalFilename: string): ArbiterFeeParseResult {
  if (!/\.xlsx?$/i.test(originalFilename)) throw new Error("Only .xls and .xlsx Arbiter files are supported.")
  if (fileBuffer.byteLength === 0) throw new Error("The Arbiter file is empty.")
  if (fileBuffer.byteLength > MAX_FILE_SIZE_BYTES) throw new Error("The Arbiter file must be 10 MB or smaller.")

  const workbook = XLSX.read(fileBuffer, { type: "array", cellDates: true, cellFormula: true, bookVBA: false })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) throw new Error("The Arbiter workbook does not contain a worksheet.")
  const sheet = workbook.Sheets[firstSheetName]
  if (!sheet?.["!ref"]) throw new Error("The Arbiter worksheet is empty.")
  const range = XLSX.utils.decode_range(sheet["!ref"])
  const dataRowCount = Math.max(0, range.e.r - range.s.r)
  if (dataRowCount > MAX_DATA_ROWS) throw new Error(`The Arbiter file exceeds the ${MAX_DATA_ROWS.toLocaleString("en-US")} row limit.`)

  const matches: ArbiterFeeParsedMatch[] = []
  const assignments: ArbiterFeeParsedAssignment[] = []
  const issues: ArbiterFeeParseIssue[] = []

  for (let row = range.s.r + 1; row <= range.e.r; row += 1) {
    const sourceRowNumber = row + 1
    const rowHasAnyValue = Object.values(COLUMNS).some((column) => cellText(cellAt(sheet, row, column)) !== "")
    if (!rowHasAnyValue) continue
    if (hasFormula(sheet, row)) {
      issues.push({ sourceRowNumber, code: "formula_not_allowed", message: "Formula cells are not allowed in Arbiter fee import data." })
      continue
    }

    const gameId = cellText(cellAt(sheet, row, COLUMNS.gameId))
    if (!gameId) {
      issues.push({ sourceRowNumber, code: "missing_game_id", message: "Arbiter game ID is required." })
      continue
    }

    const matchDateRaw = cellText(cellAt(sheet, row, COLUMNS.date))
    const kickoffTimeRaw = cellText(cellAt(sheet, row, COLUMNS.time))
    const matchDate = parseDateCell(cellAt(sheet, row, COLUMNS.date))
    const kickoffTime = parseTimeCell(cellAt(sheet, row, COLUMNS.time))
    if (!matchDate) issues.push({ sourceRowNumber, code: "invalid_match_date", message: "Match date could not be interpreted." })
    if (kickoffTimeRaw && !kickoffTime) issues.push({ sourceRowNumber, code: "invalid_kickoff_time", message: "Kickoff time could not be interpreted." })

    const match: ArbiterFeeParsedMatch = {
      sourceRowNumber,
      gameId,
      matchDate,
      matchDateRaw,
      kickoffTime,
      kickoffTimeRaw,
      sport: cellText(cellAt(sheet, row, COLUMNS.sport)),
      division: cellText(cellAt(sheet, row, COLUMNS.division)),
      league: cellText(cellAt(sheet, row, COLUMNS.league)),
      site: cellText(cellAt(sheet, row, COLUMNS.site)),
      homeTeam: cellText(cellAt(sheet, row, COLUMNS.home)),
      awayTeam: cellText(cellAt(sheet, row, COLUMNS.away)),
      comments: cellText(cellAt(sheet, row, COLUMNS.comments)),
    }
    matches.push(match)

    const officials: Array<[ArbiterFeeRole, number]> = [["center", COLUMNS.center], ["ar1", COLUMNS.ar1], ["ar2", COLUMNS.ar2]]
    for (const [role, column] of officials) {
      const arbiterRefereeName = cellText(cellAt(sheet, row, column))
      if (!arbiterRefereeName) continue
      const amounts = getArbiterFeeAmounts(role)
      assignments.push({
        ...match,
        role,
        arbiterRefereeName,
        canonicalAssignmentKey: buildArbiterFeeAssignmentKey(gameId, role),
        ...amounts,
      })
    }
  }

  return {
    originalFilename,
    sha256: createHash("sha256").update(Buffer.from(fileBuffer)).digest("hex"),
    matches,
    assignments,
    issues,
  }
}
