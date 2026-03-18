"use client"

import { useState, useRef } from "react"
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

  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

    } catch (err: any) {
      setMessage(err.message)
    }

    setLoadingImport(false)
  }

  function updateRow(index: number, field: keyof ArbiterGame, value: string) {
    if (!preview) return

    const updated = [...preview]
    updated[index] = { ...updated[index], [field]: value }
    setPreview(updated)
  }

  function deleteRow(index: number) {
    if (!preview) return
    setPreview(preview.filter((_, i) => i !== index))
  }

  function renderStatus(status?: string) {

    if (status === "duplicate_db") {
      return (
        <span className="text-red-400 text-xs font-medium">
          Already Imported
        </span>
      )
    }

    if (status === "duplicate_file") {
      return (
        <span className="text-yellow-400 text-xs font-medium">
          Duplicate
        </span>
      )
    }

    return (
      <span className="text-emerald-400 text-xs font-medium">
        OK
      </span>
    )
  }

  return (

    <div className="max-w-6xl space-y-6">

      {/* FILE INPUT */}
      <div className="space-y-3">

        <label className="text-sm text-gray-400">
          Upload Arbiter File
        </label>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="
            flex items-center justify-between
            bg-[#0B0F0F]/80
            border border-white/10
            rounded-xl
            px-4 py-3
            hover:border-emerald-500/30
            transition
            cursor-pointer
          "
        >
          <div className="flex flex-col">

            <span className={`text-sm ${file ? "text-emerald-400" : "text-white"}`}>
              {file ? file.name : "Select .xls or .xlsx file"}
            </span>

            <span className="text-xs text-gray-500">
              Arbiter export only
            </span>

          </div>

          <span className="
            text-xs px-3 py-1 rounded-lg
            bg-emerald-500/10
            text-emerald-400
            border border-emerald-500/20
          ">
            Browse
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null
              setFile(selected)
              setPreview(null)
            }}
            className="hidden"
          />

        </div>

        <button
          onClick={handlePreview}
          disabled={loadingPreview}
          className="
            px-4 py-2 rounded-lg
            bg-[#0B0F0F]
            border border-white/10
            text-white text-sm
            hover:border-yellow-400/40
            hover:text-yellow-300
            transition
          "
        >
          {loadingPreview ? "Parsing file..." : "Preview Matches"}
        </button>

      </div>

      {message && (
        <p className="text-sm text-red-500">{message}</p>
      )}

      {/* PREVIEW */}
      {preview && (

        <div className="space-y-6">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-semibold text-white">
              Preview ({preview.length} matches)
            </h2>

            <button
              onClick={() => {
                setPreview(null)
                setFile(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""
                }
              }}
              className="
                text-xs px-3 py-1.5 rounded-lg
                border border-red-500/20
                text-red-400
                hover:bg-red-500/10
                transition
              "
            >
              Reset Import
            </button>

          </div>

          <div className="
            grid gap-4
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
          ">

            {preview.map((g, index) => (

              <div
                key={g.game_id + index}
                className="
                  bg-[#0B0F0F]/80
                  border border-white/10
                  rounded-2xl
                  p-4
                  space-y-3
                  hover:border-emerald-500/30
                  transition
                "
              >

                <div className="flex justify-between items-start">

                  <div>
                    <p className="text-white text-sm font-semibold">
                      {g.home} vs {g.away}
                    </p>

                    <p className="text-xs text-gray-400">
                      {g.division}
                    </p>
                  </div>

                  {renderStatus(g.status)}

                </div>

                <div className="space-y-2 text-xs">

                  <input
                    value={g.kickoff}
                    onChange={(e) => updateRow(index, "kickoff", e.target.value)}
                    className="w-full bg-[#071f1c] border border-white/10 rounded px-2 py-1 text-white"
                  />

                  <input
                    value={g.site}
                    onChange={(e) => updateRow(index, "site", e.target.value)}
                    className="w-full bg-[#071f1c] border border-white/10 rounded px-2 py-1 text-white"
                  />

                </div>

                <div className="space-y-2">

                  {[["center_referee", g.center_referee],
                    ["ar1", g.ar1],
                    ["ar2", g.ar2]].map(([field, value]) => (

                    <select
                      key={field}
                      value={value}
                      onChange={(e) =>
                        updateRow(index, field as keyof ArbiterGame, e.target.value)
                      }
                      className="w-full bg-[#071f1c] border border-white/10 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value={value}>{value}</option>
                      {members.map(m => (
                        <option key={m.id} value={m.full_name}>
                          {m.full_name}
                        </option>
                      ))}
                    </select>

                  ))}

                </div>

                <div className="flex justify-between items-center pt-2">

                  <span className="text-xs text-gray-500">
                    ID: {g.game_id}
                  </span>

                  <button
                    onClick={() => deleteRow(index)}
                    className="
                      text-xs px-2 py-1 rounded
                      border border-red-500/20
                      text-red-400
                      hover:bg-red-500/10
                    "
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

          <button
            onClick={handleImport}
            disabled={loadingImport}
            className="
              px-5 py-2 rounded-lg
              bg-emerald-500
              hover:bg-emerald-400
              text-black font-semibold
              transition
              shadow-lg hover:shadow-emerald-500/30
            "
          >
            {loadingImport ? "Importing..." : "Import Matches"}
          </button>

        </div>

      )}

    </div>
  )
}