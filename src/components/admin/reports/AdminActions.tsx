"use client"

import { useState } from "react"

export default function AdminActions({
  reportId,
  status,
}: {
  reportId: string
  status: string
}) {

  const [revisionNotes, setRevisionNotes] = useState("")
  const [showReviewBox, setShowReviewBox] = useState(false)

  async function updateStatus(newStatus: string) {

    await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status: newStatus,
        revision_notes: revisionNotes,
      }),
    })

    location.reload()
  }

  return (

    <div className="
      bg-[#0B0F0F]
      border border-white/10
      rounded-2xl
      p-5
      space-y-4
    ">

      {/* TITLE */}
      <p className="
        text-sm font-semibold
        text-gray-300
        tracking-tight
      ">
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

        {/* TOGGLE REVIEW */}
        {!showReviewBox && (
          <button
            onClick={() => setShowReviewBox(true)}
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
        )}

      </div>

      {/* REVIEW FEEDBACK */}
      {showReviewBox && (

        <div className="space-y-3">

          <textarea
            value={revisionNotes}
            onChange={(e) =>
              setRevisionNotes(e.target.value)
            }

            placeholder="
Please explain what needs to be corrected in this report...
            "

            rows={5}

            className="
              w-full
              rounded-xl
              border border-white/10
              bg-black/30
              px-4 py-3
              text-sm text-white
              placeholder:text-gray-500
              focus:outline-none
              focus:border-yellow-400/40
              resize-none
            "
          />

          <div className="flex gap-3">

            {/* CANCEL */}
            <button
              onClick={() => {
                setShowReviewBox(false)
                setRevisionNotes("")
              }}

              className="
                flex-1
                rounded-xl
                border border-white/10
                bg-white/5
                px-4 py-2.5
                text-sm text-gray-300
                hover:bg-white/10
                transition
              "
            >
              Cancel
            </button>

            {/* SEND */}
            <button
              onClick={() =>
                updateStatus("revision_required")
              }

              disabled={!revisionNotes.trim()}

              className="
                flex-1
                rounded-xl
                bg-yellow-500
                px-4 py-2.5
                text-sm font-semibold text-black
                hover:bg-yellow-400
                transition
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >
              Submit Review
            </button>

          </div>

        </div>

      )}

    </div>

  )
}