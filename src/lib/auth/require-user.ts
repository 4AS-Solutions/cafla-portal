import { redirect } from "next/navigation"
import { getUser } from "./get-user"

export async function requireUser() {

  const user = await getUser()

  if (!user) {
    redirect("/login?reason=session-expired")
  }

  return user
}