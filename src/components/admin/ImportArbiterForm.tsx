"use client"

import { useState } from "react"
import { toast } from "sonner"

type ArbiterGame = {
  game_id: string
  kickoff: string
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

export default function ImportArbiterPage() {

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ArbiterGame[] | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingImport, setLoadingImport] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handlePreview() {

    if (!file) {
      setMessage("Please select a file first.")
      return
    }

    setMessage(null)
    setLoadingPreview(true)

    try {

      const form = new FormData()
      form.append("file", file)

      const res = await fetch("/api/admin/import-arbiter/preview", {
        method: "POST",
        body: form
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse file")
      }

      setPreview(data.games)

    } catch (err: any) {
      setMessage(err.message)
    }

    setLoadingPreview(false)
  }

  async function handleImport() {

    if (!file) {
      setMessage("No file selected.")
      return
    }

    setLoadingImport(true)
    setMessage(null)

    try {

      const form = new FormData()
      form.append("file", file)

      const res = await fetch("/api/admin/import-arbiter/import", {
        method: "POST",
        body: form
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Import failed")
      }

      setMessage(`${data.imported} matches imported successfully.`)
      toast.success(`${data.imported} matches imported successfully.`)
      setPreview(null)
      setFile(null)

    } catch (err: any) {
      setMessage(err.message)
    }

    setLoadingImport(false)
  }

  return (

    <div className="max-w-5xl space-y-6">

      <div className="space-y-3">

        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={(e) => {
            const selected = e.target.files?.[0] || null
            setFile(selected)
            setPreview(null)
          }}
        />

        <button
          onClick={handlePreview}
          disabled={loadingPreview}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loadingPreview ? "Parsing file..." : "Preview File"}
        </button>

      </div>

      {message && (
        <p className="text-sm text-red-500">
          {message}
        </p>
      )}

      {preview && (

        <div className="space-y-4">

          <h2 className="text-lg font-semibold">
            Preview ({preview.length} games detected)
          </h2>

          <div className="border rounded-lg overflow-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-100">

                <tr>
                  <th className="p-2 text-left">Game</th>
                  <th className="p-2 text-left">Kickoff</th>
                  <th className="p-2 text-left">Site</th>
                  <th className="p-2 text-left">Division</th>
                  <th className="p-2 text-left">Home</th>
                  <th className="p-2 text-left">Away</th>
                  <th className="p-2 text-left">Center Referee</th>
                  <th className="p-2 text-left">Assistant Referee 1</th>
                  <th className="p-2 text-left">Assistant Referee 2</th>
                </tr>

              </thead>

              <tbody>

                {preview.map((g) => (

                  <tr key={g.game_id} className="border-t">

                    <td className="p-2">{g.game_id}</td>
                    <td className="p-2">{g.kickoff}</td>
                    <td className="p-2">{g.site}</td>
                    <td className="p-2">{g.division}</td>
                    <td className="p-2">{g.home}</td>
                    <td className="p-2">{g.away}</td>
                    <td className="p-2">{g.center_referee}</td>
                    <td className="p-2">{g.ar1}</td>
                    <td className="p-2">{g.ar2}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <button
            onClick={handleImport}
            disabled={loadingImport}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {loadingImport ? "Importing..." : "Import Matches"}
          </button>

        </div>

      )}

    </div>

  )
}