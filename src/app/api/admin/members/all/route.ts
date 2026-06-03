import { getAllMembers } from "@/src/lib/queries/getAllMembers"
import { NextResponse } from "next/server"


export async function GET() {

  const members = await getAllMembers()

  return NextResponse.json({
    members
  })
}