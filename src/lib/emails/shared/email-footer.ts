export function getEmailFooter() {

  return `
  
    <tr>
      <td style="padding-bottom:20px;">
        <div style="
          height:1px;
          background:rgba(255,255,255,0.06);
        "></div>
      </td>
    </tr>

    <tr>
      <td>
        <p style="
          margin:0;
          font-size:13px;
          color:#64748b;
          line-height:1.6;
        ">
          This message was sent automatically by the
          CAFLA Referee Development Platform.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:16px;">
        <p style="
          margin:0;
          font-size:13px;
          color:#475569;
        ">
          — CAFLA BOARD
        </p>
      </td>
    </tr>

  `
}