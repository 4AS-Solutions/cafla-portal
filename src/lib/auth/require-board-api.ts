import { getProfile } from "@/src/lib/queries/get-profile"
import { requireUser } from "./require-user"

export async function requireBoardApi() {

    await requireUser()

    const data = await getProfile()

    if (!data?.profile) {
        throw new Error("Unauthorized")
    }

    if (data.profile.role !== "board") {
        throw new Error("Forbidden")
    }

    return data.profile
}