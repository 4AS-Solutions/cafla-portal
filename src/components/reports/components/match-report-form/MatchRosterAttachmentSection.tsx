"use client"

import {
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react"

import {
  Camera,
  Eye,
  FileCheck2,
  FileText,
  RefreshCw,
  RotateCcw,
  Upload,
  X,
} from "lucide-react"

import FilePreviewDialog from "@/src/components/shared/FilePreviewDialog"
import { Input } from "@/src/components/ui/input"

export type RosterUploadMode =
  | "combined"
  | "separate"
  | null

export type ExistingRosterAttachment = {
  id: string

  asset_type:
    | "roster_combined"
    | "roster_home"
    | "roster_away"

  storage_path: string
  signed_url?: string | null
  uploaded_at?: string | null
}

type MatchRosterAttachmentSectionProps = {
  isReadOnly: boolean

  rosterUploadMode: RosterUploadMode
  setRosterUploadMode: (
    mode: RosterUploadMode
  ) => void

  combinedRosterFile: File | null
  setCombinedRosterFile: (
    file: File | null
  ) => void

  homeRosterFile: File | null
  setHomeRosterFile: (
    file: File | null
  ) => void

  awayRosterFile: File | null
  setAwayRosterFile: (
    file: File | null
  ) => void

  existingAttachments?:
    ExistingRosterAttachment[]
}

type ExistingAttachmentCardProps = {
  title: string
  attachment: ExistingRosterAttachment
  isReadOnly: boolean
  onPreview: () => void
  onReplace: () => void
}

type NewAttachmentCardProps = {
  title: string
  file: File
  replacementOfExistingFile: boolean
  isReadOnly: boolean
  onPreview: () => void
  onReplace: () => void
  onCancelSelection: () => void
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`
}

function getFilenameFromPath(
  storagePath: string
) {
  const filename =
    storagePath.split("/").pop()

  return filename || "Roster document"
}

function formatUploadedDate(
  uploadedAt?: string | null
) {
  if (!uploadedAt) {
    return null
  }

  const date = new Date(uploadedAt)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date)
}

function ExistingAttachmentCard({
  title,
  attachment,
  isReadOnly,
  onPreview,
  onReplace,
}: ExistingAttachmentCardProps) {
  const filename = getFilenameFromPath(
    attachment.storage_path
  )

  const uploadedDate = formatUploadedDate(
    attachment.uploaded_at
  )

  return (
    <div
      className="
        rounded-xl
        border border-emerald-500/25
        bg-emerald-500/[0.06]
        p-4
      "
    >
      <div
        className="
          flex flex-col gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileCheck2
              className="
                h-4 w-4
                shrink-0
                text-emerald-400
              "
            />

            <p
              className="
                text-sm font-medium
                text-emerald-300
              "
            >
              {title}
            </p>
          </div>

          <p
            className="
              mt-1 truncate
              text-sm text-white
            "
            title={filename}
          >
            {filename}
          </p>

          <p
            className="
              mt-1 text-xs
              text-gray-400
            "
          >
            Current file
            {uploadedDate
              ? ` • Uploaded ${uploadedDate}`
              : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPreview}
            disabled={!attachment.signed_url}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border border-[#D4A93A]/20
              px-3 py-2
              text-sm text-[#D4A93A]
              transition
              hover:bg-[#D4A93A]/10

              disabled:cursor-not-allowed
              disabled:opacity-40
              disabled:hover:bg-transparent
            "
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>

          {!isReadOnly && (
            <button
              type="button"
              onClick={onReplace}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                border border-white/10
                px-3 py-2
                text-sm text-gray-200
                transition
                hover:bg-white/10
              "
            >
              <RefreshCw className="h-4 w-4" />
              Replace
            </button>
          )}
        </div>
      </div>

      {!isReadOnly && (
        <p
          className="
            mt-3
            border-t border-white/5
            pt-3
            text-xs leading-5
            text-gray-500
          "
        >
          This file will remain attached unless
          a replacement is successfully submitted.
        </p>
      )}
    </div>
  )
}

function NewAttachmentCard({
  title,
  file,
  replacementOfExistingFile,
  isReadOnly,
  onPreview,
  onReplace,
  onCancelSelection,
}: NewAttachmentCardProps) {
  return (
    <div
      className="
        rounded-xl
        border border-[#D4A93A]/30
        bg-[#D4A93A]/[0.06]
        p-4
      "
    >
      <div
        className="
          flex flex-col gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Upload
              className="
                h-4 w-4
                shrink-0
                text-[#D4A93A]
              "
            />

            <p
              className="
                text-sm font-medium
                text-[#e7c35d]
              "
            >
              {replacementOfExistingFile
                ? "Replacement selected"
                : title}
            </p>
          </div>

          <p
            className="
              mt-1 truncate
              text-sm text-white
            "
            title={file.name}
          >
            {file.name}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {formatFileSize(file.size)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border border-[#D4A93A]/20
              px-3 py-2
              text-sm text-[#D4A93A]
              transition
              hover:bg-[#D4A93A]/10
            "
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>

          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={onReplace}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border border-white/10
                  px-3 py-2
                  text-sm text-gray-200
                  transition
                  hover:bg-white/10
                "
              >
                <RefreshCw className="h-4 w-4" />

                {replacementOfExistingFile
                  ? "Change"
                  : "Replace"}
              </button>

              <button
                type="button"
                onClick={onCancelSelection}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border border-red-500/20
                  px-3 py-2
                  text-sm text-red-300
                  transition
                  hover:bg-red-500/10
                "
              >
                {replacementOfExistingFile ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}

                {replacementOfExistingFile
                  ? "Cancel replacement"
                  : "Remove"}
              </button>
            </>
          )}
        </div>
      </div>

      {replacementOfExistingFile &&
        !isReadOnly && (
          <p
            className="
              mt-3
              border-t border-white/5
              pt-3
              text-xs leading-5
              text-gray-500
            "
          >
            The current roster will only be removed
            after this replacement is submitted
            successfully.
          </p>
        )}
    </div>
  )
}

export default function MatchRosterAttachmentSection({
  isReadOnly,
  rosterUploadMode,
  setRosterUploadMode,
  combinedRosterFile,
  setCombinedRosterFile,
  homeRosterFile,
  setHomeRosterFile,
  awayRosterFile,
  setAwayRosterFile,
  existingAttachments = [],
}: MatchRosterAttachmentSectionProps) {
  const combinedInputRef =
    useRef<HTMLInputElement>(null)

  const homeInputRef =
    useRef<HTMLInputElement>(null)

  const awayInputRef =
    useRef<HTMLInputElement>(null)

  const [previewOpen, setPreviewOpen] =
    useState(false)

  const [previewFile, setPreviewFile] =
    useState<File | null>(null)

  const [previewTitle, setPreviewTitle] =
    useState("File Preview")

  const existingCombinedAttachment =
    existingAttachments.find(
      (attachment) =>
        attachment.asset_type ===
        "roster_combined"
    ) ?? null

  const existingHomeAttachment =
    existingAttachments.find(
      (attachment) =>
        attachment.asset_type ===
        "roster_home"
    ) ?? null

  const existingAwayAttachment =
    existingAttachments.find(
      (attachment) =>
        attachment.asset_type ===
        "roster_away"
    ) ?? null

  const openNewFilePreview = (
    file: File,
    title: string
  ) => {
    setPreviewFile(file)
    setPreviewTitle(title)
    setPreviewOpen(true)
  }

  const openExistingPreview = (
    attachment:
      ExistingRosterAttachment | null
  ) => {
    if (!attachment?.signed_url) {
      return
    }

    window.open(
      attachment.signed_url,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const handlePreviewOpenChange = (
    open: boolean
  ) => {
    setPreviewOpen(open)

    if (!open) {
      setPreviewFile(null)
      setPreviewTitle("File Preview")
    }
  }

  const clearInput = (
    inputRef:
      RefObject<HTMLInputElement | null>
  ) => {
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const openFileInput = (
    inputRef:
      RefObject<HTMLInputElement | null>
  ) => {
    if (isReadOnly) return

    clearInput(inputRef)
    inputRef.current?.click()
  }

  const selectCombinedMode = () => {
    if (isReadOnly) return

    setRosterUploadMode("combined")

    setHomeRosterFile(null)
    setAwayRosterFile(null)

    clearInput(homeInputRef)
    clearInput(awayInputRef)
  }

  const selectSeparateMode = () => {
    if (isReadOnly) return

    setRosterUploadMode("separate")

    setCombinedRosterFile(null)
    clearInput(combinedInputRef)
  }

  const handleCombinedFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setCombinedRosterFile(
      event.target.files?.[0] ?? null
    )
  }

  const handleHomeFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setHomeRosterFile(
      event.target.files?.[0] ?? null
    )
  }

  const handleAwayFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setAwayRosterFile(
      event.target.files?.[0] ?? null
    )
  }

  const cancelCombinedSelection = () => {
    if (isReadOnly) return

    setCombinedRosterFile(null)
    clearInput(combinedInputRef)

    if (
      previewFile === combinedRosterFile
    ) {
      handlePreviewOpenChange(false)
    }
  }

  const cancelHomeSelection = () => {
    if (isReadOnly) return

    setHomeRosterFile(null)
    clearInput(homeInputRef)

    if (previewFile === homeRosterFile) {
      handlePreviewOpenChange(false)
    }
  }

  const cancelAwaySelection = () => {
    if (isReadOnly) return

    setAwayRosterFile(null)
    clearInput(awayInputRef)

    if (previewFile === awayRosterFile) {
      handlePreviewOpenChange(false)
    }
  }

  const renderCombinedAttachment = () => {
    if (combinedRosterFile) {
      return (
        <NewAttachmentCard
          title="Both rosters attached"
          file={combinedRosterFile}
          replacementOfExistingFile={Boolean(
            existingCombinedAttachment
          )}
          isReadOnly={isReadOnly}
          onPreview={() =>
            openNewFilePreview(
              combinedRosterFile,
              "Combined Rosters"
            )
          }
          onReplace={() =>
            openFileInput(combinedInputRef)
          }
          onCancelSelection={
            cancelCombinedSelection
          }
        />
      )
    }

    if (existingCombinedAttachment) {
      return (
        <ExistingAttachmentCard
          title="Current combined rosters"
          attachment={
            existingCombinedAttachment
          }
          isReadOnly={isReadOnly}
          onPreview={() =>
            openExistingPreview(
              existingCombinedAttachment
            )
          }
          onReplace={() =>
            openFileInput(combinedInputRef)
          }
        />
      )
    }

    return (
      <button
        type="button"
        disabled={isReadOnly}
        onClick={() =>
          openFileInput(combinedInputRef)
        }
        className="
          w-full
          rounded-xl
          border border-dashed border-white/15
          bg-white/[0.02]
          px-5 py-8
          text-center
          transition
          hover:border-[#D4A93A]/60
          hover:bg-white/[0.05]

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <div className="flex flex-col items-center">
          <Upload
            className="
              mb-3 h-6 w-6
              text-[#D4A93A]
            "
          />

          <span className="font-medium text-white">
            Choose File
          </span>

          <span
            className="
              mt-1 text-sm
              text-gray-400
            "
          >
            PDF, JPG, PNG or WEBP containing
            both rosters
          </span>
        </div>
      </button>
    )
  }

  const renderSeparateAttachment = ({
    side,
    file,
    existingAttachment,
    inputRef,
    setFile,
    title,
  }: {
    side: "Home" | "Away"
    file: File | null
    existingAttachment:
      ExistingRosterAttachment | null
    inputRef:
      RefObject<HTMLInputElement | null>
    setFile: (file: File | null) => void
    title: string
  }) => {
    const cancelSelection = () => {
      setFile(null)
      clearInput(inputRef)

      if (previewFile === file) {
        handlePreviewOpenChange(false)
      }
    }

    return (
      <div
        className="
          rounded-xl
          border border-white/10
          bg-white/[0.02]
          p-4
        "
      >
        <h4 className="font-medium text-white">
          {side} Roster
        </h4>

        <p className="mt-1 text-sm text-gray-400">
          Take a clear photo of the {side} team
          roster.
        </p>

        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          disabled={isReadOnly}
          onChange={(event) =>
            setFile(
              event.target.files?.[0] ?? null
            )
          }
          className="hidden"
        />

        <div className="mt-4">
          {file ? (
            <NewAttachmentCard
              title={`${side} roster attached`}
              file={file}
              replacementOfExistingFile={Boolean(
                existingAttachment
              )}
              isReadOnly={isReadOnly}
              onPreview={() =>
                openNewFilePreview(file, title)
              }
              onReplace={() =>
                openFileInput(inputRef)
              }
              onCancelSelection={
                cancelSelection
              }
            />
          ) : existingAttachment ? (
            <ExistingAttachmentCard
              title={`Current ${side.toLowerCase()} roster`}
              attachment={existingAttachment}
              isReadOnly={isReadOnly}
              onPreview={() =>
                openExistingPreview(
                  existingAttachment
                )
              }
              onReplace={() =>
                openFileInput(inputRef)
              }
            />
          ) : (
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() =>
                openFileInput(inputRef)
              }
              className="
                w-full
                rounded-lg
                border border-dashed border-white/15
                px-4 py-6
                text-sm font-medium
                text-white
                transition
                hover:border-[#D4A93A]/60
                hover:bg-white/[0.05]

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <span
                className="
                  flex items-center
                  justify-center gap-2
                "
              >
                <Camera
                  className="
                    h-4 w-4
                    text-[#D4A93A]
                  "
                />

                Take {side} Photo
              </span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <section
        className="
          rounded-2xl
          border border-white/10
          bg-[#0B0F0F]/80
          p-6
          backdrop-blur-md
        "
      >
        <div className="mb-5">
          <h2
            className="
              text-lg font-semibold
              text-white
            "
          >
            Match Rosters
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Attach the official rosters for both
            teams.
          </p>
        </div>

        {!rosterUploadMode && (
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={selectCombinedMode}
              className="
                rounded-xl
                border border-white/10
                bg-white/[0.03]
                p-5 text-left
                transition
                hover:border-[#D4A93A]/60
                hover:bg-white/[0.06]

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    rounded-lg
                    bg-[#D4A93A]/10
                    p-2 text-[#D4A93A]
                  "
                >
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <span
                    className="
                      block font-semibold
                      text-white
                    "
                  >
                    Upload One File
                  </span>

                  <span
                    className="
                      mt-2 block
                      text-sm leading-6
                      text-gray-400
                    "
                  >
                    Upload one PDF or image that
                    contains both the Home and Away
                    rosters.
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={isReadOnly}
              onClick={selectSeparateMode}
              className="
                rounded-xl
                border border-white/10
                bg-white/[0.03]
                p-5 text-left
                transition
                hover:border-[#D4A93A]/60
                hover:bg-white/[0.06]

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    rounded-lg
                    bg-[#D4A93A]/10
                    p-2 text-[#D4A93A]
                  "
                >
                  <Camera className="h-5 w-5" />
                </div>

                <div>
                  <span
                    className="
                      block font-semibold
                      text-white
                    "
                  >
                    Take Two Photos
                  </span>

                  <span
                    className="
                      mt-2 block
                      text-sm leading-6
                      text-gray-400
                    "
                  >
                    Take one photo of the Home roster
                    and one photo of the Away roster.
                  </span>
                </div>
              </div>
            </button>
          </div>
        )}

        {rosterUploadMode === "combined" && (
          <div className="space-y-4">
            <div
              className="
                flex flex-col gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <div className="flex items-center gap-2">
                  <FileText
                    className="
                      h-4 w-4
                      text-[#D4A93A]
                    "
                  />

                  <h3 className="font-medium text-white">
                    Combined Rosters
                  </h3>
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  The selected file must contain both
                  team rosters.
                </p>
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={selectSeparateMode}
                  className="
                    text-sm font-medium
                    text-[#D4A93A]
                    transition
                    hover:text-[#e7c35d]
                  "
                >
                  Take two photos instead
                </button>
              )}
            </div>

            <Input
              ref={combinedInputRef}
              type="file"
              accept="
                application/pdf,
                image/jpeg,
                image/png,
                image/webp
              "
              disabled={isReadOnly}
              onChange={
                handleCombinedFileChange
              }
              className="hidden"
            />

            {renderCombinedAttachment()}
          </div>
        )}

        {rosterUploadMode === "separate" && (
          <div className="space-y-4">
            <div
              className="
                flex flex-col gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <div className="flex items-center gap-2">
                  <Camera
                    className="
                      h-4 w-4
                      text-[#D4A93A]
                    "
                  />

                  <h3 className="font-medium text-white">
                    Separate Rosters
                  </h3>
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  Take one clear photo of each
                  team&apos;s roster.
                </p>

                <p className="mt-4 text-xs text-gray-500">
                  Make sure the full roster, player
                  numbers and signatures are clearly
                  visible.
                </p>
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={selectCombinedMode}
                  className="
                    text-sm font-medium
                    text-[#D4A93A]
                    transition
                    hover:text-[#e7c35d]
                  "
                >
                  Upload one file instead
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {renderSeparateAttachment({
                side: "Home",
                file: homeRosterFile,
                existingAttachment:
                  existingHomeAttachment,
                inputRef: homeInputRef,
                setFile: setHomeRosterFile,
                title: "Home Roster",
              })}

              {renderSeparateAttachment({
                side: "Away",
                file: awayRosterFile,
                existingAttachment:
                  existingAwayAttachment,
                inputRef: awayInputRef,
                setFile: setAwayRosterFile,
                title: "Away Roster",
              })}
            </div>
          </div>
        )}
      </section>

      <FilePreviewDialog
        open={previewOpen}
        onOpenChange={
          handlePreviewOpenChange
        }
        title={previewTitle}
        file={previewFile}
      />
    </>
  )
}