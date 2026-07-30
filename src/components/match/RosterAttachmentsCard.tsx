"use client"

import {
  ExternalLink,
  Eye,
  FileImage,
  FileText,
  Paperclip,
} from "lucide-react"

export type RosterAssetType =
  | "roster_combined"
  | "roster_home"
  | "roster_away"

export type RosterAttachment = {
  id: string
  assetType: RosterAssetType
  storagePath: string
  signedUrl: string
  uploadedAt: string | null
}

type RosterAttachmentsCardProps = {
  attachments?: RosterAttachment[] | null
  onPreview: (attachment: RosterAttachment) => void
}

const ATTACHMENT_LABELS: Record<RosterAssetType, string> = {
  roster_combined: "Combined Team Rosters",
  roster_home: "Home Team Roster",
  roster_away: "Away Team Roster",
}

const ATTACHMENT_ORDER: Record<RosterAssetType, number> = {
  roster_combined: 0,
  roster_home: 1,
  roster_away: 2,
}

function getFileName(storagePath: string) {
  const pathWithoutQuery = storagePath.split("?")[0]
  const fileName = pathWithoutQuery.split("/").pop()

  return fileName || "Roster document"
}

function getFileExtension(storagePath: string) {
  const fileName = getFileName(storagePath)
  const extension = fileName.split(".").pop()

  if (!extension || extension === fileName) {
    return ""
  }

  return extension.toLowerCase()
}

function isImageFile(storagePath: string) {
  const extension = getFileExtension(storagePath)

  return ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
}

function formatUploadedDate(uploadedAt: string | null) {
  if (!uploadedAt) {
    return null
  }

  const date = new Date(uploadedAt)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function AttachmentRow({
  attachment,
  onPreview,
}: {
  attachment: RosterAttachment
  onPreview: (attachment: RosterAttachment) => void
}) {
  const isImage = isImageFile(attachment.storagePath)
  const fileName = getFileName(attachment.storagePath)
  const uploadedDate = formatUploadedDate(attachment.uploadedAt)
  const label = ATTACHMENT_LABELS[attachment.assetType]

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/10 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
          {isImage ? (
            <FileImage className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">
            {label}
          </p>

          <p
            className="mt-0.5 truncate text-xs text-gray-400"
            title={fileName}
          >
            {fileName}
          </p>

          {uploadedDate && (
            <p className="mt-1 text-[11px] text-gray-500">
              Uploaded {uploadedDate}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onPreview(attachment)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-white/10"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>

        <a
          href={attachment.signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-white/10"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </a>
      </div>
    </div>
  )
}

export function RosterAttachmentsCard({
  attachments,
  onPreview,
}: RosterAttachmentsCardProps) {
  const validAttachments = (attachments ?? [])
    .filter(
      (attachment) =>
        attachment?.id &&
        attachment?.storagePath &&
        attachment?.signedUrl &&
        attachment?.assetType in ATTACHMENT_LABELS
    )
    .sort(
      (a, b) =>
        ATTACHMENT_ORDER[a.assetType] -
        ATTACHMENT_ORDER[b.assetType]
    )

  if (validAttachments.length === 0) {
    return null
  }

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-yellow-400" />

          <h2 className="text-sm font-semibold text-white">
            Roster Attachments
          </h2>
        </div>

        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
          {validAttachments.length}{" "}
          {validAttachments.length === 1 ? "File" : "Files"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {validAttachments.map((attachment) => (
          <AttachmentRow
            key={attachment.id}
            attachment={attachment}
            onPreview={onPreview}
          />
        ))}
      </div>
    </section>
  )
}