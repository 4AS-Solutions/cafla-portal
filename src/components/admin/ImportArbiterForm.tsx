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
  status?: "ok" | "duplicate_db" | "duplicate_file"
}

type Member = {
  id: string
  full_name: string
}

export default function ImportArbiterForm() {

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ArbiterGame[] | null>(null)
  const [members, setMembers] = useState<Member[]>([])

  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingImport, setLoadingImport] = useState(false)

  const [message, setMessage] = useState<string | null>(null)

  async function handlePreview() {

    if (!file) {
      setMessage("Please select a file first.")
      return
    }

    setLoadingPreview(true)
    setMessage(null)

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

      const membersRes = await fetch("/api/admin/members")
      const membersData = await membersRes.json()

      setMembers(membersData.members)

    } catch (err: any) {

      setMessage(err.message)

    }

    setLoadingPreview(false)
  }

  async function handleImport() {

    if (!preview || preview.length === 0) {
      setMessage("No matches to import.")
      return
    }

    setLoadingImport(true)
    setMessage(null)

    try {

      const res = await fetch("/api/admin/import-arbiter/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rows: preview
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Import failed")
      }

      toast.success(`${data.imported} matches imported successfully.`)

      setPreview(null)
      setFile(null)

    } catch (err: any) {

      setMessage(err.message)

    }

    setLoadingImport(false)
  }

  function updateRow(index: number, field: keyof ArbiterGame, value: string) {

    if (!preview) return

    const updated = [...preview]

    updated[index] = {
      ...updated[index],
      [field]: value
    }

    setPreview(updated)
  }

  function deleteRow(index: number) {

    if (!preview) return

    const updated = preview.filter((_, i) => i !== index)

    setPreview(updated)
  }

  function renderStatus(status?: string) {

    if (status === "duplicate_db") {
      return <span className="text-red-600 text-xs">Already Imported</span>
    }

    if (status === "duplicate_file") {
      return <span className="text-yellow-600 text-xs">Duplicate in file</span>
    }

    return <span className="text-green-600 text-xs">OK</span>
  }

  return (

    <div className="max-w-6xl space-y-6">

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
        <p className="text-sm text-red-500">{message}</p>
      )}

      {preview && (

        <div className="space-y-4">

          <h2 className="text-lg font-semibold">
            Preview ({preview.length} games detected)
          </h2>

          <div className="border rounded-lg overflow-x-auto">

            <table className="min-w-[1300px] text-sm">

              <thead className="bg-gray-100 sticky top-0">

                <tr>
                  <th className="p-2 text-left">Game</th>
                  <th className="p-2 text-left">Kickoff</th>
                  <th className="p-2 text-left">Site</th>
                  <th className="p-2 text-left">Division</th>
                  <th className="p-2 text-left">Home</th>
                  <th className="p-2 text-left">Away</th>
                  <th className="p-2 text-left">Center</th>
                  <th className="p-2 text-left">AR1</th>
                  <th className="p-2 text-left">AR2</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>

              </thead>

              <tbody>

                {preview.map((g, index) => (

                  <tr key={g.game_id + index} className="border-t">

                    <td className="p-2">{g.game_id}</td>

                    <td className="p-2">
                      <input
                        value={g.kickoff}
                        onChange={(e) => updateRow(index, "kickoff", e.target.value)}
                        className="border px-2 py-1 rounded min-w-[170px]"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        value={g.site}
                        onChange={(e) => updateRow(index, "site", e.target.value)}
                        className="border px-2 py-1 rounded min-w-[230px]"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        value={g.division}
                        onChange={(e) => updateRow(index, "division", e.target.value)}
                        className="border px-2 py-1 rounded min-w-[150px]"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        value={g.home}
                        onChange={(e) => updateRow(index, "home", e.target.value)}
                        className="border px-2 py-1 rounded min-w-[220px]"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        value={g.away}
                        onChange={(e) => updateRow(index, "away", e.target.value)}
                        className="border px-2 py-1 rounded min-w-[220px]"
                      />
                    </td>

                    <td className="p-2">

                      <select
                        value={g.center_referee}
                        onChange={(e) =>
                          updateRow(index, "center_referee", e.target.value)
                        }
                        className="border rounded px-2 py-1 min-w-[200px]"
                      >

                        <option value={g.center_referee}>
                          {g.center_referee}
                        </option>

                        {members.map(m => (
                          <option key={m.id} value={m.full_name}>
                            {m.full_name}
                          </option>
                        ))}

                      </select>

                    </td>

                    <td className="p-2">

                      <select
                        value={g.ar1}
                        onChange={(e) =>
                          updateRow(index, "ar1", e.target.value)
                        }
                        className="border rounded px-2 py-1 min-w-[200px]"
                      >

                        <option value={g.ar1}>
                          {g.ar1}
                        </option>

                        {members.map(m => (
                          <option key={m.id} value={m.full_name}>
                            {m.full_name}
                          </option>
                        ))}

                      </select>

                    </td>

                    <td className="p-2">

                      <select
                        value={g.ar2}
                        onChange={(e) =>
                          updateRow(index, "ar2", e.target.value)
                        }
                        className="border rounded px-2 py-1 min-w-[200px]"
                      >

                        <option value={g.ar2}>
                          {g.ar2}
                        </option>

                        {members.map(m => (
                          <option key={m.id} value={m.full_name}>
                            {m.full_name}
                          </option>
                        ))}

                      </select>

                    </td>

                    <td className="p-2">
                      {renderStatus(g.status)}
                    </td>

                    <td className="p-2">

                      <button
                        onClick={() => deleteRow(index)}
                        className="text-red-600 text-xs"
                      >
                        Delete
                      </button>

                    </td>

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