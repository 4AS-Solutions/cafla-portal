"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type PendingAction =
  | "approve"
  | "review"
  | null

export default function AdminActions({
  reportId,
  status,
}: {
  reportId: string
  status: string
}) {
  const router = useRouter()

  const [revisionNotes, setRevisionNotes] =
    useState("")

  const [showReviewBox, setShowReviewBox] =
    useState(false)

  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null)

  const isSubmitting = pendingAction !== null

  async function updateStatus(
    newStatus: "approved" | "revision_required"
  ) {
    const action: PendingAction =
      newStatus === "approved"
        ? "approve"
        : "review"

    try {
      setPendingAction(action)

      const response = await fetch(
        `/api/admin/reports/${reportId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
            revision_notes: revisionNotes,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
          "Unable to update the report."
        )
      }

      if (
        newStatus === "approved" &&
        result.emailSent === false
      ) {
        alert(
          result.message ||
          "The report was approved, but the email could not be sent."
        )
      }

      router.refresh()
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the report."
      )
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div
      className="
        space-y-4
        rounded-2xl
        border border-white/10
        bg-[#0B0F0F]
        p-5
      "
    >
      {/* TITLE */}
      <p
        className="
          text-sm font-semibold
          tracking-tight text-gray-300
        "
      >
        Admin Actions
      </p>

      {/* BUTTONS */}
      <div className="flex flex-col gap-3">
        {/* APPROVE */}
        <button
          type="button"
          onClick={() =>
            updateStatus("approved")
          }
          disabled={isSubmitting}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-500
            px-4 py-2.5
            font-semibold
            text-black
            transition-all
            duration-200

            hover:bg-emerald-400
            hover:shadow-lg
            hover:shadow-emerald-500/20

            active:scale-[0.97]

            disabled:cursor-not-allowed
            disabled:opacity-60
            disabled:hover:bg-emerald-500
            disabled:hover:shadow-none
            disabled:active:scale-100
          "
        >
          {pendingAction === "approve" && (
            <span
              aria-hidden="true"
              className="
                h-4 w-4
                shrink-0
                animate-spin
                rounded-full
                border-2
                border-black/25
                border-t-black
              "
            />
          )}

          <span>
            {pendingAction === "approve"
              ? "Approving & Sending Email..."
              : "Approve Report"}
          </span>
        </button>

        {/* TOGGLE REVIEW */}
        {!showReviewBox && (
          <button
            type="button"
            onClick={() =>
              setShowReviewBox(true)
            }
            disabled={isSubmitting}
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-yellow-500
              px-4 py-2.5
              font-semibold
              text-black
              transition-all
              duration-200

              hover:bg-yellow-400
              hover:shadow-lg
              hover:shadow-yellow-500/20

              active:scale-[0.97]

              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:bg-yellow-500
              disabled:hover:shadow-none
              disabled:active:scale-100
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
            onChange={(event) =>
              setRevisionNotes(
                event.target.value
              )
            }
            disabled={isSubmitting}
            placeholder="Please explain what needs to be corrected in this report..."
            rows={5}
            className="
              w-full
              resize-none
              rounded-xl
              border border-white/10
              bg-black/30
              px-4 py-3
              text-sm text-white
              placeholder:text-gray-500
              focus:border-yellow-400/40
              focus:outline-none

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />

          <div className="flex gap-3">
            {/* CANCEL */}
            <button
              type="button"
              disabled={isSubmitting}
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
                transition
                hover:bg-white/10

                disabled:cursor-not-allowed
                disabled:opacity-50
                disabled:hover:bg-white/5
              "
            >
              Cancel
            </button>

            {/* SEND REVIEW */}
            <button
              type="button"
              onClick={() =>
                updateStatus(
                  "revision_required"
                )
              }
              disabled={
                isSubmitting ||
                !revisionNotes.trim()
              }
              className="
                inline-flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-yellow-500
                px-4 py-2.5
                text-sm font-semibold
                text-black
                transition

                hover:bg-yellow-400

                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:hover:bg-yellow-500
              "
            >
              {pendingAction === "review" && (
                <span
                  aria-hidden="true"
                  className="
                    h-4 w-4
                    shrink-0
                    animate-spin
                    rounded-full
                    border-2
                    border-black/25
                    border-t-black
                  "
                />
              )}

              <span>
                {pendingAction === "review"
                  ? "Sending Review..."
                  : "Submit Review"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}