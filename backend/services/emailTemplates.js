import { EMAIL_LOGO_CID } from "./emailLogo.js";

const BRAND_PRIMARY = "#0a9396";
const BRAND_DARK = "#005f73";
const BRAND_BG = "#f0fafa";

/**
 * תבנית HTML מקצועית לקוד אימות — RTL, לוגו למעלה (URL ציבורי או CID), עברית.
 * @param {{ fullName?: string, code: string, expiresMinutes?: number, logoUrl?: string|null, logoCid?: string|null }} opts
 */
export function buildVerificationEmailHtml({
  fullName = "",
  code,
  expiresMinutes = 10,
  logoUrl = null,
  logoCid = EMAIL_LOGO_CID,
}) {
  const greeting = fullName.trim()
    ? `שלום ${escapeHtml(fullName.trim())},`
    : "שלום,";
  const safeCode = escapeHtml(String(code));
  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="דינמיקר" width="180" style="display:block;margin:0 auto;max-width:180px;width:180px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />`
    : logoCid
      ? `<img src="cid:${logoCid}" alt="דינמיקר" width="180" style="display:block;margin:0 auto;max-width:180px;width:180px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />`
      : `<p style="margin:0;font-size:28px;font-weight:800;color:${BRAND_DARK};letter-spacing:1px;">דינמיקר</p>`;

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>קוד אימות — דינמיקר</title>
</head>
<body style="margin:0;padding:0;background-color:#eef5f5;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#eef5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d8ecec;box-shadow:0 8px 24px rgba(0,95,115,0.08);">
          <tr>
            <td style="background:#ffffff;padding:28px 24px 24px;text-align:center;border-bottom:4px solid ${BRAND_PRIMARY};">
              ${logoBlock}
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 24px;text-align:right;direction:rtl;">
              <h1 style="margin:0 0 12px;font-size:22px;color:${BRAND_DARK};font-weight:700;">אימות כתובת האימייל</h1>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#334155;">${greeting}<br/>תודה שנרשמת ל<strong style="color:${BRAND_PRIMARY};">דינמיקר</strong>. כדי להשלים את ההרשמה, הזן את קוד האימות הבא באפליקציה:</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:8px 0 20px;">
                    <div style="display:inline-block;background:${BRAND_BG};border:2px dashed ${BRAND_PRIMARY};border-radius:14px;padding:18px 36px;">
                      <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:${BRAND_DARK};font-family:'Courier New',monospace;direction:ltr;display:inline-block;">${safeCode}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#64748b;">הקוד תקף ל-<strong>${expiresMinutes} דקות</strong> בלבד.</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#94a3b8;">אם לא ביקשת להירשם — ניתן להתעלם מהודעה זו.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid #e2efef;text-align:center;background:#f8fcfc;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">© דינמיקר · הודעה אוטומטית — אין להשיב למייל זה</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
