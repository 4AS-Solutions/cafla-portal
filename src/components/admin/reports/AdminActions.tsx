"use client"

export default function AdminActions({
  reportId,
  status,
}: {
  reportId: string
  status: string
}) {

  async function updateStatus(newStatus: string) {
    await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })

    location.reload()
  }

  return (

    <div className="bg-[#0B0F0F] border border-white/10 rounded-2xl p-5 space-y-3">

      <p className="text-sm text-gray-400">
        Admin Actions
      </p>

      <div className="flex flex-col gap-2">

        <button
          onClick={() => updateStatus("approved")}
          className="
            w-full px-4 py-2 rounded-xl
            bg-emerald-500 text-black font-medium
            hover:bg-emerald-400 transition
          "
        >
          Approve Report
        </button>

        <button
          onClick={() => updateStatus("revision_required")}
          className="
            w-full px-4 py-2 rounded-xl
            bg-yellow-500 text-black font-medium
            hover:bg-yellow-400 transition
          "
        >
          Send to Review
        </button>

      </div>

    </div>
  )
}