"use client"

import { useState } from "react"
import { toast } from "sonner"

export default function ImportArbiterForm() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      toast.error("Please select a file.")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/import-arbiter", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to import matches.")
      }

      toast.success(`${data.imported} matches imported successfully.`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unexpected import error."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Importing..." : "Import Matches"}
      </button>
    </form>
  )
}