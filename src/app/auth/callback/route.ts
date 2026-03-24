import { supabaseServer } from "@/src/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
console.log(" CALLBACK: ====================================")
console.log(" CALLBACK: 🚀 CALLBACK START")
console.log(" CALLBACK: 🌐 URL:", req.url)

const requestUrl = new URL(req.url)
const code = requestUrl.searchParams.get("code")

console.log(" CALLBACK: 🔑 CODE:", code)

const supabase = await supabaseServer()

// 🔍 1. SESSION BEFORE
const {
  data: { user: existingUser },
} = await supabase.auth.getUser()

console.log(" CALLBACK: 👤 EXISTING USER BEFORE EXCHANGE:", existingUser)

// 🔁 EXCHANGE
if (!existingUser && code) {
  console.log(" CALLBACK: 🔄 EXCHANGING CODE FOR SESSION...")

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  console.log(" CALLBACK: ❌ EXCHANGE ERROR:", error)
}

// 🔍 2. SESSION AFTER
const {
  data: { user },
} = await supabase.auth.getUser()

console.log(" CALLBACK: 👤 USER AFTER EXCHANGE:", user)

if (!user) {
  console.log(" CALLBACK: ⛔ NO USER → REDIRECT LOGIN CALLBACK: ")
  return NextResponse.redirect(new URL("/login", requestUrl.origin))
}

// 🔍 3. MEMBER
const { data: member, error: memberError } = await supabase
  .from("members")
  .select("status, phone")
  .eq("id", user.id)
  .maybeSingle()

console.log(" CALLBACK: 👤 MEMBER:", member)
console.log(" CALLBACK: ❌ MEMBER ERROR:", memberError)

// 🔀 DECISION
if (!member || !member.phone || member.status === "invited") {
  console.log(" CALLBACK: ➡️ REDIRECT → COMPLETE PROFILE")
  return NextResponse.redirect(
    new URL("/complete-profile", requestUrl.origin)
  )
}

console.log(" CALLBACK: ➡️ REDIRECT → PORTAL")
console.log(" CALLBACK: ====================================")

return NextResponse.redirect(new URL("/portal", requestUrl.origin))
}