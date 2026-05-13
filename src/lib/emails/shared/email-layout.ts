import { getEmailFooter } from "./email-footer"

export function getEmailLayout(content: string) {

  return `

<!DOCTYPE html>
<html>

  <body style="
    margin:0;
    padding:0;
    background-color:#020617;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
    color:#e2e8f0;
  ">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">

      <tr>
        <td align="center">

          <table width="520" cellpadding="0" cellspacing="0" style="
            background:#0b1513;
            border:1px solid rgba(16,185,129,0.15);
            border-radius:16px;
            padding:40px 32px;
          ">

            <!-- LOGO -->
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <img 
                  src="https://sugvnzymrvdfgmgchbud.supabase.co/storage/v1/object/public/images/cafla-v.png"
                  alt="CAFLA"
                  width="140"
                  style="display:block;"
                />
              </td>
            </tr>

            ${content}

            ${getEmailFooter()}

          </table>

          <!-- OUTER FOOTER -->
          <table width="520" style="margin-top:16px;">

            <tr>
              <td align="center">

                <p style="
                  margin:0;
                  font-size:12px;
                  color:#334155;
                ">
                  CAFLA Referee Platform
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>

    </table>

  </body>

</html>

  `
}