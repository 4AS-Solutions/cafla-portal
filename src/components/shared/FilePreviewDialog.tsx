"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { FileQuestion, Loader2 } from "lucide-react"

type FilePreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  title?: string

  file?: File | null
  url?: string | null

  mimeType?: string | null
}

type PreviewType = "image" | "pdf" | "unsupported"

function getPreviewType({
  file,
  url,
  mimeType,
}: {
  file?: File | null
  url?: string | null
  mimeType?: string | null
}): PreviewType {
  const resolvedMimeType = file?.type || mimeType || ""

  if (resolvedMimeType.startsWith("image/")) {
    return "image"
  }

  if (resolvedMimeType === "application/pdf") {
    return "pdf"
  }

  const normalizedUrl = url?.split("?")[0].toLowerCase() ?? ""

  if (
    normalizedUrl.endsWith(".jpg") ||
    normalizedUrl.endsWith(".jpeg") ||
    normalizedUrl.endsWith(".png") ||
    normalizedUrl.endsWith(".webp")
  ) {
    return "image"
  }

  if (normalizedUrl.endsWith(".pdf")) {
    return "pdf"
  }

  return "unsupported"
}

export default function FilePreviewDialog({
  open,
  onOpenChange,
  title = "File Preview",
  file,
  url,
  mimeType,
}: FilePreviewDialogProps) {
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!file) {
      setLocalPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)

    setLocalPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  useEffect(() => {
    if (open) {
      setIsLoading(true)
    }
  }, [open, file, url])

  const previewUrl = localPreviewUrl || url || null

  const previewType = useMemo(
    () =>
      getPreviewType({
        file,
        url,
        mimeType,
      }),
    [file, url, mimeType],
  )

  const fileName = file?.name ?? "Attached file"

  const handleContentLoaded = () => {
    setIsLoading(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-2rem)] max-w-5xl flex-col overflow-hidden border-white/10 bg-[#0B0F0F] p-0 text-white">
        <DialogHeader className="border-b border-white/10 px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-white">
            {title}
          </DialogTitle>

          <DialogDescription className="truncate text-sm text-gray-400">
            {fileName}
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-black/30 p-4 sm:min-h-[500px]">
          {!previewUrl ? (
            <div className="flex flex-col items-center text-center">
              <FileQuestion className="h-10 w-10 text-gray-500" />

              <p className="mt-3 font-medium text-white">
                No file available
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Select a file before opening the preview.
              </p>
            </div>
          ) : previewType === "image" ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B0F0F]/80">
                  <Loader2 className="h-7 w-7 animate-spin text-[#D4A93A]" />
                </div>
              )}

              <img
                src={previewUrl}
                alt={title}
                onLoad={handleContentLoaded}
                onError={handleContentLoaded}
                className="max-h-[70vh] max-w-full rounded-lg object-contain"
              />
            </>
          ) : previewType === "pdf" ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B0F0F]/80">
                  <Loader2 className="h-7 w-7 animate-spin text-[#D4A93A]" />
                </div>
              )}

              <iframe
                src={previewUrl}
                title={title}
                onLoad={handleContentLoaded}
                className="h-[65vh] min-h-[500px] w-full rounded-lg border border-white/10 bg-white"
              />
            </>
          ) : (
            <div className="flex flex-col items-center text-center">
              <FileQuestion className="h-10 w-10 text-gray-500" />

              <p className="mt-3 font-medium text-white">
                Preview unavailable
              </p>

              <p className="mt-1 max-w-md text-sm text-gray-400">
                This file type cannot be previewed. Supported formats are
                PDF, JPG, PNG and WEBP.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}