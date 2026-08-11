"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

import {
  Check,
  Loader2,
  UserPlus,
  Users,
} from "lucide-react"

type EnrollmentType =
  | "existing_member"
  | "new_member"

type InviteResponse = {
  success?: boolean
  error?: string

  invitationSent?: boolean
  developmentEnrolled?: boolean

  member?: {
    id: string
    email: string
    fullName: string
  }

  development?: {
    cycleId: string
    cycleName: string
    enrollmentType: EnrollmentType
    status: string
    eligibleForRanking: boolean
  }
}

export default function InviteMemberDialog() {
  const router = useRouter()

  const [open, setOpen] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [email, setEmail] =
    useState("")

  const [fullName, setFullName] =
    useState("")

  const [
    enrollmentType,
    setEnrollmentType,
  ] = useState<EnrollmentType>(
    "existing_member"
  )

  function resetForm() {
    setEmail("")
    setFullName("")
    setEnrollmentType(
      "existing_member"
    )
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (loading) return

    setLoading(true)

    try {
      const response = await fetch(
        "/api/admin/members/invite",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              email.trim(),

            full_name:
              fullName.trim(),

            enrollment_type:
              enrollmentType,
          }),
        }
      )

      const data =
        (await response.json()) as InviteResponse

      if (!response.ok) {
        /*
         * Important:
         * The invitation may have succeeded while
         * Development enrollment failed.
         */
        if (
          data.invitationSent &&
          !data.developmentEnrolled
        ) {
          throw new Error(
            data.error ??
              "The invitation was sent, but Development enrollment failed."
          )
        }

        throw new Error(
          data.error ??
            "Unable to invite member."
        )
      }

      toast.success(
        data.development?.cycleName
          ? `Member invited and enrolled in ${data.development.cycleName}.`
          : "Member invited successfully."
      )

      resetForm()

      setOpen(false)

      router.refresh()
    } catch (error) {
      console.error(
        "[INVITE MEMBER] Request failed:",
        error
      )

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to invite member."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (loading) return

        setOpen(nextOpen)
      }}
    >
      {/* TRIGGER */}
      <DialogTrigger asChild>
        <Button
          className="
            flex items-center gap-2
            border border-emerald-900/40
            bg-[#0b1513]
            text-white
            transition
            hover:border-yellow-400/40
            hover:text-yellow-300
          "
        >
          <UserPlus className="h-4 w-4" />

          Invite Member
        </Button>
      </DialogTrigger>

      {/* MODAL */}
      <DialogContent
        className="
          flex
          max-h-[90dvh]
          w-[calc(100%-2rem)]
          max-w-md
          flex-col
          overflow-hidden
          rounded-2xl
          border border-white/10
          bg-[#07110e]
          p-0
          text-white
          shadow-2xl
        "
      >
        {/* HEADER */}
        <div className="
          shrink-0
          border-b
          border-white/10
          bg-emerald-500/[0.035]
          px-5
          py-4
          sm:px-6
          sm:py-5
        ">

          <DialogHeader>

            <div className="flex items-start gap-4">

              <div
                className="
                  flex h-10 w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/10
                "
              >
                <UserPlus className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Member Management
                </p>

                <DialogTitle className="text-base font-semibold text-white">
                  Invite Member
                </DialogTitle>

                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Send an invitation and enroll the member in the active Development cycle.
                </p>
              </div>

            </div>

          </DialogHeader>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="
            min-h-0
            flex-1
            space-y-5
            overflow-y-auto
            overscroll-contain
            p-5
            sm:p-6
          "
        >
          {/* FULL NAME */}
          <div className="space-y-2">

            <Label className="text-sm font-medium text-gray-300">
              Full Name
            </Label>

            <Input
              value={fullName}
              onChange={(event) =>
                setFullName(
                  event.target.value
                )
              }
              placeholder="Example: Alfredo Sandoval"
              required
              disabled={loading}
              className="
                border-white/10
                bg-black/30
                text-white
                placeholder:text-gray-600
                focus:border-yellow-400/40
                focus:ring-yellow-400/10
              "
            />

          </div>

          {/* EMAIL */}
          <div className="space-y-2">

            <Label className="text-sm font-medium text-gray-300">
              Email
            </Label>

            <Input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="member@email.com"
              required
              disabled={loading}
              className="
                border-white/10
                bg-black/30
                text-white
                placeholder:text-gray-600
                focus:border-yellow-400/40
                focus:ring-yellow-400/10
              "
            />

          </div>

          {/* MEMBER TYPE */}
          <div className="space-y-3">

            <div>
              <Label className="text-sm font-medium text-gray-300">
                Member Type
              </Label>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Select whether this person already belongs to CAFLA or is joining for the first time.
              </p>
            </div>

            <div className="grid gap-3">

              <EnrollmentCard
                title="Existing CAFLA Member"
                description="Already belongs to CAFLA and is being added to the current Development cycle."
                checked={
                  enrollmentType ===
                  "existing_member"
                }
                disabled={loading}
                onClick={() =>
                  setEnrollmentType(
                    "existing_member"
                  )
                }
              />

              <EnrollmentCard
                title="New CAFLA Member"
                description="New member joining CAFLA and entering the current Development cycle."
                checked={
                  enrollmentType ===
                  "new_member"
                }
                disabled={loading}
                onClick={() =>
                  setEnrollmentType(
                    "new_member"
                  )
                }
              />

            </div>

          </div>

          {/* DEVELOPMENT INFO */}
          <div
            className="
              flex gap-3
              rounded-xl
              border
              border-emerald-500/15
              bg-emerald-500/[0.06]
              p-4
            "
          >
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

            <div>
              <p className="text-sm font-medium text-emerald-200">
                Automatic Development Enrollment
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                The system will enroll this member in the active Development cycle with active status and ranking eligibility.
              </p>
            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() =>
                setOpen(false)
              }
              className="
                border-white/10
                bg-white/[0.03]
                text-gray-300
                hover:bg-white/[0.07]
                hover:text-white
              "
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                loading ||
                !email.trim() ||
                !fullName.trim()
              }
              className="
                bg-emerald-500
                text-black
                hover:bg-emerald-400
                disabled:opacity-50
              "
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite & Enroll
                </>
              )}
            </Button>

          </div>

        </form>

      </DialogContent>
    </Dialog>
  )
}

function EnrollmentCard({
  title,
  description,
  checked,
  disabled,
  onClick,
}: {
  title: string
  description: string
  checked: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        items-start
        gap-3
        rounded-xl
        border
        p-4
        text-left
        transition-colors
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${
          checked
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]"
        }
      `}
    >
      <span
        className={`
          mt-0.5
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-md
          border
          ${
            checked
              ? "border-emerald-400 bg-emerald-500 text-black"
              : "border-white/15 bg-black/20 text-transparent"
          }
        `}
      >
        <Check className="h-4 w-4" />
      </span>

      <span>
        <span className="block text-sm font-medium text-white">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-gray-500">
          {description}
        </span>
      </span>
    </button>
  )
}