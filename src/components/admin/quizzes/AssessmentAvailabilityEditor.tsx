"use client"

import {
  CalendarClock,
  Check,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  useMemo,
  useState,
} from "react"
import { toast } from "sonner"

type AssessmentAvailabilityEditorProps = {
  assessmentId: string
  openFrom: string | null
  openUntil: string | null
  status:
    | "draft"
    | "published"
    | "closed"
    | "archived"
}

type AvailabilityResponse = {
  success: boolean

  assessment?: {
    id: string
    status: string
    open_from: string
    open_until: string
    updated_at: string
  }

  error?: string
}

export default function AssessmentAvailabilityEditor({
  assessmentId,
  openFrom,
  openUntil,
  status,
}: AssessmentAvailabilityEditorProps) {
  const router = useRouter()

  const initialOpenFrom =
    useMemo(
      () =>
        toDateTimeLocalValue(
          openFrom
        ),
      [openFrom]
    )

  const initialOpenUntil =
    useMemo(
      () =>
        toDateTimeLocalValue(
          openUntil
        ),
      [openUntil]
    )

  const [editing, setEditing] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [
    openFromValue,
    setOpenFromValue,
  ] = useState(initialOpenFrom)

  const [
    openUntilValue,
    setOpenUntilValue,
  ] = useState(initialOpenUntil)

  const isArchived =
    status === "archived"

  const hasChanges =
    openFromValue !== initialOpenFrom ||
    openUntilValue !== initialOpenUntil

  function startEditing() {
    if (isArchived) {
      toast.error(
        "Archived assessments cannot be modified."
      )

      return
    }

    setOpenFromValue(
      initialOpenFrom
    )

    setOpenUntilValue(
      initialOpenUntil
    )

    setEditing(true)
  }

  function cancelEditing() {
    if (saving) {
      return
    }

    setOpenFromValue(
      initialOpenFrom
    )

    setOpenUntilValue(
      initialOpenUntil
    )

    setEditing(false)
  }

  function resetDates() {
    setOpenFromValue(
      initialOpenFrom
    )

    setOpenUntilValue(
      initialOpenUntil
    )
  }

  async function saveAvailability() {
    if (
      !openFromValue ||
      !openUntilValue
    ) {
      toast.error(
        "Opening and closing dates are required."
      )

      return
    }

    const openFromDate =
      new Date(openFromValue)

    const openUntilDate =
      new Date(openUntilValue)

    if (
      Number.isNaN(
        openFromDate.getTime()
      ) ||
      Number.isNaN(
        openUntilDate.getTime()
      )
    ) {
      toast.error(
        "Enter valid opening and closing dates."
      )

      return
    }

    if (
      openFromDate.getTime() >=
      openUntilDate.getTime()
    ) {
      toast.error(
        "The closing date must be after the opening date."
      )

      return
    }

    if (!hasChanges) {
      toast.info(
        "No availability changes to save."
      )

      setEditing(false)

      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `/api/admin/quizzes/${assessmentId}/availability`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            /*
             * datetime-local contains the
             * browser's local time. Converting
             * it to ISO preserves the intended
             * instant for PostgreSQL timestamptz.
             */
            open_from:
              openFromDate.toISOString(),

            open_until:
              openUntilDate.toISOString(),
          }),
        }
      )

      const result =
        (await response.json()) as AvailabilityResponse

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to update assessment availability."
        )
      }

      toast.success(
        "Assessment availability updated."
      )

      setEditing(false)

      /*
       * Refresh the Server Component so
       * getAdminQuizEditor() returns the
       * newly saved values.
       */
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update assessment availability."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F0F]/80">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10">
            <CalendarClock className="h-5 w-5 text-yellow-400" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Availability
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Control when members can access this assessment.
            </p>
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            disabled={isArchived}
            className={`
              inline-flex
              min-h-10
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-4
              text-sm
              font-semibold
              transition
              sm:w-auto
              ${
                isArchived
                  ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-gray-600"
                  : "border-white/10 bg-white/[0.04] text-gray-200 hover:border-yellow-400/30 hover:bg-white/[0.07] hover:text-white"
              }
            `}
          >
            <Pencil className="h-4 w-4" />
            Edit Availability
          </button>
        )}
      </div>

      {!editing ? (
        <ReadOnlyAvailability
          openFrom={openFrom}
          openUntil={openUntil}
          status={status}
        />
      ) : (
        <div className="space-y-5 p-5 sm:p-6">
          {/* INPUTS */}
          <div className="grid gap-4 md:grid-cols-2">
            <DateTimeField
              id="assessment-open-from"
              label="Opens"
              value={openFromValue}
              onChange={
                setOpenFromValue
              }
              disabled={saving}
            />

            <DateTimeField
              id="assessment-open-until"
              label="Closes"
              value={openUntilValue}
              onChange={
                setOpenUntilValue
              }
              disabled={saving}
            />
          </div>

          {/* PREVIEW */}
          <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.06] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-300">
              Availability preview
            </p>

            <div className="mt-2 grid gap-1 text-sm text-gray-300">
              <p>
                <span className="text-gray-500">
                  Opens:
                </span>{" "}
                {formatLocalInput(
                  openFromValue
                )}
              </p>

              <p>
                <span className="text-gray-500">
                  Closes:
                </span>{" "}
                {formatLocalInput(
                  openUntilValue
                )}
              </p>
            </div>
          </div>

          {/* WARNING FOR CLOSED */}
          {status === "closed" && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100/80">
              Changing these dates does not automatically change the assessment lifecycle status. A closed assessment remains closed until it is explicitly reopened.
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-2 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={resetDates}
              disabled={
                saving ||
                !hasChanges
              }
              className="
                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.025]
                px-4
                text-sm
                font-medium
                text-gray-400
                transition
                hover:bg-white/[0.06]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={
                  cancelEditing
                }
                disabled={saving}
                className="
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.025]
                  px-4
                  text-sm
                  font-medium
                  text-gray-300
                  transition
                  hover:bg-white/[0.06]
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  saveAvailability
                }
                disabled={
                  saving ||
                  !hasChanges
                }
                className="
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-emerald-500
                  px-4
                  text-sm
                  font-semibold
                  text-black
                  transition
                  hover:bg-emerald-400
                  disabled:cursor-not-allowed
                  disabled:bg-white/10
                  disabled:text-gray-600
                "
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function ReadOnlyAvailability({
  openFrom,
  openUntil,
  status,
}: {
  openFrom: string | null
  openUntil: string | null
  status:
    | "draft"
    | "published"
    | "closed"
    | "archived"
}) {
  return (
    <div className="space-y-4 p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <AvailabilityValue
          label="Opens"
          value={formatDateTime(
            openFrom
          )}
        />

        <AvailabilityValue
          label="Closes"
          value={formatDateTime(
            openUntil
          )}
        />
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

        <p className="text-sm leading-relaxed text-gray-400">
          {status === "archived"
            ? "This assessment is archived. Its availability can no longer be changed."
            : "Availability changes do not modify questions, previous attempts, or member scores."}
        </p>
      </div>
    </div>
  )
}

function DateTimeField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string
  label: string
  value: string
  onChange: (
    value: string
  ) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500"
      >
        {label}
      </label>

      <input
        id={id}
        type="datetime-local"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        disabled={disabled}
        className="
          min-h-12
          w-full
          rounded-xl
          border
          border-white/10
          bg-black/25
          px-4
          text-sm
          text-white
          outline-none
          transition
          focus:border-yellow-400/40
          focus:ring-2
          focus:ring-yellow-400/10
          disabled:cursor-not-allowed
          disabled:opacity-60
          [color-scheme:dark]
        "
      />
    </div>
  )
}

function AvailabilityValue({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>
    </div>
  )
}

/*
 * Convert an ISO/timestamptz value into the
 * local YYYY-MM-DDTHH:mm format required by
 * <input type="datetime-local">.
 */
function toDateTimeLocalValue(
  value: string | null
) {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (
    Number.isNaN(date.getTime())
  ) {
    return ""
  }

  const year =
    date.getFullYear()

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0")

  const day = String(
    date.getDate()
  ).padStart(2, "0")

  const hours = String(
    date.getHours()
  ).padStart(2, "0")

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDateTime(
  value: string | null
) {
  if (!value) {
    return "Not configured"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        "America/Los_Angeles",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value))
}

function formatLocalInput(
  value: string
) {
  if (!value) {
    return "Not configured"
  }

  const date = new Date(value)

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Invalid date"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date)
}