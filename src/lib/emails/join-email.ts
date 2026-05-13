import { getEmailLayout } from "./shared/email-layout"

type JoinEmailProps = {
  name: string
}

export function getJoinEmail({
  name,
}: JoinEmailProps) {

  return getEmailLayout(`

    <!-- GREETING -->
    <tr>
      <td style="padding-bottom:16px;">
        <p style="
          margin:0;
          font-size:14px;
          color:#94a3b8;
        ">
          Hello ${name},
        </p>
      </td>
    </tr>

    <!-- TITLE -->
    <tr>
      <td style="padding-bottom:12px;">
        <h1 style="
          margin:0;
          font-size:24px;
          font-weight:700;
          color:#f8fafc;
          letter-spacing:-0.3px;
        ">
          Welcome to CAFLA
        </h1>
      </td>
    </tr>

    <!-- CONTENT -->
    <tr>
      <td style="padding-bottom:24px;">
        <p style="
          margin:0;
          font-size:15px;
          color:#cbd5e1;
          line-height:1.7;
        ">
          Thank you for submitting your introductory session request.
          <br /><br />

          Your information has been received successfully by the
          CAFLA Referee Development Program.
          <br /><br />

          A representative will contact you soon regarding upcoming
          training sessions, onboarding information, and referee development opportunities.
        </p>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td align="left" style="padding-bottom:28px;">

        <a href="https://www.cafla.org" style="
          display:inline-block;
          padding:14px 26px;
          border-radius:10px;
          text-decoration:none;
          font-size:14px;
          font-weight:600;
          color:#021312;
          background:linear-gradient(135deg,#10b981,#22c55e);
          box-shadow:0 4px 14px rgba(16,185,129,0.3);
        ">
          Visit CAFLA
        </a>

      </td>
    </tr>

  `)
}