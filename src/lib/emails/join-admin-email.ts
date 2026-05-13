import { getEmailLayout } from "./shared/email-layout"

type JoinAdminEmailProps = {
  name: string
  email: string
  phone: string
  experienceLevel: string
  ageRange: string
  referralSource: string
  attendanceIntent: string
  message?: string
}

export function getJoinAdminEmail({
  name,
  email,
  phone,
  experienceLevel,
  ageRange,
  referralSource,
  attendanceIntent,
  message,
}: JoinAdminEmailProps) {

  return getEmailLayout(`

    <!-- TITLE -->
    <tr>
      <td style="padding-bottom:12px;">
        <h1 style="
          margin:0;
          font-size:24px;
          font-weight:700;
          color:#f8fafc;
        ">
          New Join Request
        </h1>
      </td>
    </tr>

    <!-- CONTENT -->
    <tr>
      <td style="
        font-size:15px;
        color:#cbd5e1;
        line-height:1.8;
        padding-bottom:28px;
      ">

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>

        <p><strong>Experience:</strong> ${experienceLevel}</p>
        <p><strong>Age Range:</strong> ${ageRange}</p>

        <p><strong>Referral:</strong> ${referralSource}</p>

        <p><strong>Intent:</strong> ${attendanceIntent}</p>

        <p><strong>Message:</strong></p>

        <p>
          ${message || "No message provided"}
        </p>

      </td>
    </tr>

  `)
}