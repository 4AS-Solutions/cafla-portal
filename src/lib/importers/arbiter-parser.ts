import ExcelJS from "exceljs"
import * as XLSX from "xlsx"

type ArbiterRow = {
  game_id: string
  kickoff: string
  sport: string
  division: string
  league: string
  site: string
  home: string
  away: string
  comments: string
  center_referee: string
  ar1: string
  ar2: string
}

export async function parseArbiterFile(fileBuffer: ArrayBuffer) {
  let workbook = new ExcelJS.Workbook()

  try {
    await workbook.xlsx.load(fileBuffer)
  } catch {
    const xlsWorkbook = XLSX.read(fileBuffer, { type: "array" })
    const firstSheet = xlsWorkbook.Sheets[xlsWorkbook.SheetNames[0]]
    const jsonRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

    const convertedWorkbook = new ExcelJS.Workbook()
    const sheet = convertedWorkbook.addWorksheet("Sheet1")

    jsonRows.forEach((row: any) => {
      sheet.addRow(row)
    })

    workbook = convertedWorkbook
  }

  const sheet = workbook.worksheets[0]

  const rows: ArbiterRow[] = []

  sheet.eachRow((row, index) => {
    if (index === 1) return

    const gameId = row.getCell(1).text?.trim() ?? ""
    if (!gameId) return

    const date = row.getCell(2).text?.trim() ?? ""
    const day = row.getCell(3).text?.trim() ?? ""
    const time = row.getCell(4).text?.trim() ?? ""

    const sport = row.getCell(5).text?.trim() ?? ""
    const division = row.getCell(6).text?.trim() ?? ""

    const league = row.getCell(8).text?.trim() ?? ""
    const site = row.getCell(9).text?.trim() ?? ""

    const home = row.getCell(10).text?.trim() ?? ""
    const away = row.getCell(11).text?.trim() ?? ""

    const comments = row.getCell(12).text?.trim() ?? ""

    const centerReferee = row.getCell(13).text?.trim() ?? ""
    const ar1 = row.getCell(14).text?.trim() ?? ""
    const ar2 = row.getCell(15).text?.trim() ?? ""

    rows.push({
      game_id: gameId,
      kickoff: [date, day, time].filter(Boolean).join(" "),
      sport,
      division,
      league,
      site,
      home,
      away,
      comments,
      center_referee: centerReferee,
      ar1,
      ar2,
    })
  })

  return rows
}