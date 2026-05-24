import { redirect } from "next/navigation"

import { getProfile } from "@/src/lib/queries/get-profile"

import { requireUser } from "./require-user"

export async function requireBoard() {

  // 🔥 VALID SESSION
  await requireUser()

  // 🔥 GET PROFILE
  const data = await getProfile()

  // 🔥 NO PROFILE
  if (!data?.profile) {
    redirect("/login?reason=session-expired")
  }

  const { profile } = data

  // 🔥 NOT BOARD
  if (profile.role !== "board") {
    redirect("/portal")
  }

  return profile
}