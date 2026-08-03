import { Resend } from "resend"
import "server-only"

const apiKey = process.env.RESEND_API_KEY

if(!apiKey) {
    throw new Error("RESEND_API_KEY is no configured.")
}

export const resend = new Resend(apiKey)