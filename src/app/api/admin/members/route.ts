import { NextResponse } from "next/server"
import { getMembers } from "@/src/lib/queries/get-members"

export async function GET() {

  const members = await getMembers()

  return NextResponse.json({
    members
  })
}