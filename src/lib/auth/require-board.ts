import { redirect } from "next/navigation"
import { getProfile } from "@/src/lib/queries/get-profile"

export async function requireBoard() {

  const data = await getProfile()

  if (!data?.profile) {
    redirect("/login")
  }

  const { profile } = data

  if (profile.role !== "board") {
    redirect("/portal")
  }

  return profile
}