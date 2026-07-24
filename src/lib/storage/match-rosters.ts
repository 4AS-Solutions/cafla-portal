import type { SupabaseClient } from "@supabase/supabase-js"

const MATCH_ROSTERS_BUCKET = "match-rosters"

export type RosterUploadType = "combined" | "home" | "away"

type UploadMatchRosterParams = {
  supabase: SupabaseClient
  arbiterMatchId: string
  type: RosterUploadType
  file: File
}

type ReplaceMatchRosterParams = UploadMatchRosterParams & {
  previousPath?: string | null
}

function getFileExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase()

  if (extensionFromName) {
    return extensionFromName
  }

  switch (file.type) {
    case "application/pdf":
      return "pdf"
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    default:
      throw new Error("Unsupported roster file type.")
  }
}

function validateRosterFile(file: File) {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]

  const maxFileSize = 10 * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Unsupported file type. Please upload a PDF, JPG, PNG or WEBP file.",
    )
  }

  if (file.size > maxFileSize) {
    throw new Error("The roster file must be 10 MB or smaller.")
  }
}

function buildRosterPath({
  arbiterMatchId,
  type,
  file,
}: Omit<UploadMatchRosterParams, "supabase">) {
  const extension = getFileExtension(file)
  const fileId = crypto.randomUUID()

  return `${arbiterMatchId}/${type}/${fileId}.${extension}`
}

export async function uploadMatchRoster({
  supabase,
  arbiterMatchId,
  type,
  file,
}: UploadMatchRosterParams) {
  validateRosterFile(file)

  const path = buildRosterPath({
    arbiterMatchId,
    type,
    file,
  })

  const { error } = await supabase.storage
    .from(MATCH_ROSTERS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    throw new Error(`Unable to upload roster: ${error.message}`)
  }

  return path
}

export async function deleteMatchRoster(
  supabase: SupabaseClient,
  path: string,
) {
  const { error } = await supabase.storage
    .from(MATCH_ROSTERS_BUCKET)
    .remove([path])

  if (error) {
    throw new Error(`Unable to delete roster: ${error.message}`)
  }
}

export async function replaceMatchRoster({
  supabase,
  previousPath,
  arbiterMatchId,
  type,
  file,
}: ReplaceMatchRosterParams) {
  const newPath = await uploadMatchRoster({
    supabase,
    arbiterMatchId,
    type,
    file,
  })

  if (!previousPath) {
    return newPath
  }

  try {
    await deleteMatchRoster(supabase, previousPath)
  } catch (error) {
    console.error(
      "The new roster was uploaded, but the previous file could not be deleted.",
      error,
    )
  }

  return newPath
}

export async function createMatchRosterSignedUrl(
  supabase: SupabaseClient,
  path: string,
  expiresInSeconds = 600,
) {
  const { data, error } = await supabase.storage
    .from(MATCH_ROSTERS_BUCKET)
    .createSignedUrl(path, expiresInSeconds)

  if (error) {
    throw new Error(`Unable to open roster: ${error.message}`)
  }

  return data.signedUrl
}