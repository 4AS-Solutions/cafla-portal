"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { Input } from "@/src/components/ui/input"
import FilePreviewDialog from "@/src/components/shared/FilePreviewDialog"
import { Camera, Eye, FileText, Upload } from "lucide-react"

export type RosterUploadMode = "combined" | "separate" | null

type MatchRosterAttachmentSectionProps = {
  isReadOnly: boolean

  rosterUploadMode: RosterUploadMode
  setRosterUploadMode: (mode: RosterUploadMode) => void

  combinedRosterFile: File | null
  setCombinedRosterFile: (file: File | null) => void

  homeRosterFile: File | null
  setHomeRosterFile: (file: File | null) => void

  awayRosterFile: File | null
  setAwayRosterFile: (file: File | null) => void
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
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
}: MatchRosterAttachmentSectionProps) {
  const combinedInputRef = useRef<HTMLInputElement>(null)
  const homeInputRef = useRef<HTMLInputElement>(null)
  const awayInputRef = useRef<HTMLInputElement>(null)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewTitle, setPreviewTitle] = useState("File Preview")

  const openPreview = (file: File, title: string) => {
    setPreviewFile(file)
    setPreviewTitle(title)
    setPreviewOpen(true)
  }

  const handlePreviewOpenChange = (open: boolean) => {
    setPreviewOpen(open)

    if (!open) {
      setPreviewFile(null)
      setPreviewTitle("File Preview")
    }
  }

  const selectCombinedMode = () => {
    if (isReadOnly) return

    setRosterUploadMode("combined")
    setHomeRosterFile(null)
    setAwayRosterFile(null)

    if (homeInputRef.current) {
      homeInputRef.current.value = ""
    }

    if (awayInputRef.current) {
      awayInputRef.current.value = ""
    }
  }

  const selectSeparateMode = () => {
    if (isReadOnly) return

    setRosterUploadMode("separate")
    setCombinedRosterFile(null)

    if (combinedInputRef.current) {
      combinedInputRef.current.value = ""
    }
  }

  const openFileInput = (
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    if (isReadOnly) return

    if (inputRef.current) {
      inputRef.current.value = ""
      inputRef.current.click()
    }
  }

  const handleCombinedFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setCombinedRosterFile(event.target.files?.[0] ?? null)
  }

  const handleHomeFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setHomeRosterFile(event.target.files?.[0] ?? null)
  }

  const handleAwayFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setAwayRosterFile(event.target.files?.[0] ?? null)
  }

  const removeCombinedFile = () => {
    if (isReadOnly) return

    setCombinedRosterFile(null)

    if (previewFile === combinedRosterFile) {
      handlePreviewOpenChange(false)
    }

    if (combinedInputRef.current) {
      combinedInputRef.current.value = ""
    }
  }

  const removeHomeFile = () => {
    if (isReadOnly) return

    setHomeRosterFile(null)

    if (previewFile === homeRosterFile) {
      handlePreviewOpenChange(false)
    }

    if (homeInputRef.current) {
      homeInputRef.current.value = ""
    }
  }

  const removeAwayFile = () => {
    if (isReadOnly) return

    setAwayRosterFile(null)

    if (previewFile === awayRosterFile) {
      handlePreviewOpenChange(false)
    }

    if (awayInputRef.current) {
      awayInputRef.current.value = ""
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Match Rosters
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Attach the official rosters for both teams.
          </p>
        </div>

        {!rosterUploadMode && (
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={selectCombinedMode}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-[#D4A93A]/60 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#D4A93A]/10 p-2 text-[#D4A93A]">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <span className="block font-semibold text-white">
                    Upload One File
                  </span>

                  <span className="mt-2 block text-sm leading-6 text-gray-400">
                    Upload one PDF or image that already contains both the Home
                    and Away rosters.
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={isReadOnly}
              onClick={selectSeparateMode}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-[#D4A93A]/60 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#D4A93A]/10 p-2 text-[#D4A93A]">
                  <Camera className="h-5 w-5" />
                </div>

                <div>
                  <span className="block font-semibold text-white">
                    Take Two Photos
                  </span>

                  <span className="mt-2 block text-sm leading-6 text-gray-400">
                    Take one photo of the Home roster and one photo of the Away
                    roster.
                  </span>
                </div>
              </div>
            </button>
          </div>
        )}

        {rosterUploadMode === "combined" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#D4A93A]" />

                  <h3 className="font-medium text-white">
                    Combined Rosters
                  </h3>
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  The selected file must contain both team rosters.
                </p>
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={selectSeparateMode}
                  className="text-sm font-medium text-[#D4A93A] transition hover:text-[#e7c35d]"
                >
                  Take two photos instead
                </button>
              )}
            </div>

            <Input
              ref={combinedInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              disabled={isReadOnly}
              onChange={handleCombinedFileChange}
              className="hidden"
            />

            {!combinedRosterFile ? (
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => openFileInput(combinedInputRef)}
                className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-8 text-center transition hover:border-[#D4A93A]/60 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex flex-col items-center">
                  <Upload className="mb-3 h-6 w-6 text-[#D4A93A]" />

                  <span className="block font-medium text-white">
                    Choose File
                  </span>

                  <span className="mt-1 block text-sm text-gray-400">
                    PDF, JPG, PNG or WEBP containing both rosters
                  </span>
                </div>
              </button>
            ) : (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-emerald-300">
                      Both rosters attached
                    </p>

                    <p className="mt-1 truncate text-sm text-white">
                      {combinedRosterFile.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {formatFileSize(combinedRosterFile.size)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openPreview(
                          combinedRosterFile,
                          "Combined Rosters",
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-[#D4A93A]/20 px-3 py-2 text-sm text-[#D4A93A] transition hover:bg-[#D4A93A]/10"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>

                    {!isReadOnly && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            openFileInput(combinedInputRef)
                          }
                          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 transition hover:bg-white/10"
                        >
                          Replace
                        </button>

                        <button
                          type="button"
                          onClick={removeCombinedFile}
                          className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {rosterUploadMode === "separate" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-[#D4A93A]" />

                  <h3 className="font-medium text-white">
                    Separate Rosters
                  </h3>
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  Take one clear photo of each team&apos;s roster.
                </p>

                <p className="mt-4 text-xs text-gray-500">
                  Make sure the full roster, player numbers and signatures are
                  clearly visible.
                </p>
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={selectCombinedMode}
                  className="text-sm font-medium text-[#D4A93A] transition hover:text-[#e7c35d]"
                >
                  Upload one file instead
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <h4 className="font-medium text-white">
                  Home Roster
                </h4>

                <p className="mt-1 text-sm text-gray-400">
                  Take a clear photo of the Home team roster.
                </p>

                <Input
                  ref={homeInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={isReadOnly}
                  onChange={handleHomeFileChange}
                  className="hidden"
                />

                {!homeRosterFile ? (
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => openFileInput(homeInputRef)}
                    className="mt-4 w-full rounded-lg border border-dashed border-white/15 px-4 py-6 text-sm font-medium text-white transition hover:border-[#D4A93A]/60 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Camera className="h-4 w-4 text-[#D4A93A]" />
                      Take Home Photo
                    </span>
                  </button>
                ) : (
                  <div className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-3">
                    <p className="text-sm font-medium text-emerald-300">
                      Home roster attached
                    </p>

                    <p className="mt-1 truncate text-sm text-white">
                      {homeRosterFile.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {formatFileSize(homeRosterFile.size)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openPreview(homeRosterFile, "Home Roster")
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D4A93A]/20 px-3 py-2 text-sm text-[#D4A93A] transition hover:bg-[#D4A93A]/10"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </button>

                      {!isReadOnly && (
                        <>
                          <button
                            type="button"
                            onClick={() => openFileInput(homeInputRef)}
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 transition hover:bg-white/10"
                          >
                            Retake
                          </button>

                          <button
                            type="button"
                            onClick={removeHomeFile}
                            className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <h4 className="font-medium text-white">
                  Away Roster
                </h4>

                <p className="mt-1 text-sm text-gray-400">
                  Take a clear photo of the Away team roster.
                </p>

                <Input
                  ref={awayInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={isReadOnly}
                  onChange={handleAwayFileChange}
                  className="hidden"
                />

                {!awayRosterFile ? (
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => openFileInput(awayInputRef)}
                    className="mt-4 w-full rounded-lg border border-dashed border-white/15 px-4 py-6 text-sm font-medium text-white transition hover:border-[#D4A93A]/60 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Camera className="h-4 w-4 text-[#D4A93A]" />
                      Take Away Photo
                    </span>
                  </button>
                ) : (
                  <div className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-3">
                    <p className="text-sm font-medium text-emerald-300">
                      Away roster attached
                    </p>

                    <p className="mt-1 truncate text-sm text-white">
                      {awayRosterFile.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {formatFileSize(awayRosterFile.size)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openPreview(awayRosterFile, "Away Roster")
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D4A93A]/20 px-3 py-2 text-sm text-[#D4A93A] transition hover:bg-[#D4A93A]/10"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </button>

                      {!isReadOnly && (
                        <>
                          <button
                            type="button"
                            onClick={() => openFileInput(awayInputRef)}
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 transition hover:bg-white/10"
                          >
                            Retake
                          </button>

                          <button
                            type="button"
                            onClick={removeAwayFile}
                            className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <FilePreviewDialog
        open={previewOpen}
        onOpenChange={handlePreviewOpenChange}
        title={previewTitle}
        file={previewFile}
      />
    </>
  )
}