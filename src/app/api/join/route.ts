import { NextResponse } from "next/server"

import { Resend } from "resend"

import { getJoinEmail } from "@/src/lib/emails/join-email"
import { getJoinAdminEmail } from "@/src/lib/emails/join-admin-email"

const resend = new Resend(
  process.env.RESEND_API_KEY
)

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const {
      name,
      email,
      phone,
      experienceLevel,
      ageRange,
      referralSource,
      attendanceIntent,
      message,
    } = body

    // 🔥 EMAIL TO USER

    await resend.emails.send({
      from: "CAFLA <onboarding@cafla.org>",
      to: email,

      subject: "Welcome to CAFLA",

      html: getJoinEmail({
        name,
      }),
    })

    // 🔥 INTERNAL EMAIL

    await resend.emails.send({
      from: "CAFLA <onboarding@cafla.org>",
      to: "cafla1962@gmail.com",

      subject: "New Join CAFLA Submission",

      html: getJoinAdminEmail({
        name,
        email,
        phone,
        experienceLevel,
        ageRange,
        referralSource,
        attendanceIntent,
        message,
      }),
    })

    return NextResponse.json({
      success: true,
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    )

  }
}