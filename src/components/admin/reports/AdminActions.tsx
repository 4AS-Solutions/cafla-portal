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
    <div className="bg-[#0B0F0F] border border-white/10 rounded-2xl p-5 space-y-4">

      {/* TITLE */}
      <p className="text-sm font-semibold text-gray-300 tracking-tight">
        Admin Actions
      </p>

      {/* BUTTONS */}
      <div className="flex flex-col gap-3">

        {/* APPROVE */}
        <button
          onClick={() => updateStatus("approved")}
          className="
            w-full px-4 py-2.5 rounded-xl
            bg-emerald-500 text-black font-semibold
            transition-all duration-200
            hover:bg-emerald-400
            hover:shadow-lg hover:shadow-emerald-500/20
            active:scale-[0.97]
          "
        >
          Approve Report
        </button>

        {/* REVIEW */}
        <button
          onClick={() => updateStatus("revision_required")}
          className="
            w-full px-4 py-2.5 rounded-xl
            bg-yellow-500 text-black font-semibold
            transition-all duration-200
            hover:bg-yellow-400
            hover:shadow-lg hover:shadow-yellow-500/20
            active:scale-[0.97]
          "
        >
          Send to Review
        </button>

      </div>

    </div>
  )
}