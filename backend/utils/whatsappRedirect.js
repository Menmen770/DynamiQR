import { buildWhatsAppAppLink } from "./buildEncodedQrText.js";

/** המרת wa.me שמור לקישור אפליקציה (תאימות ל-QR דינמי ישנים). */
export function upgradeWaMeToWhatsAppApp(url) {
  try {
    const u = new URL(String(url || "").trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (host !== "wa.me" && host !== "api.whatsapp.com") return null;
    let phone = "";
    let text = u.searchParams.get("text") || "";
    if (host === "wa.me") {
      phone = u.pathname.replace(/^\//, "").split("/")[0].replace(/\D/g, "");
    } else {
      phone = String(u.searchParams.get("phone") || "").replace(/\D/g, "");
    }
    if (!phone) return null;
    return buildWhatsAppAppLink(phone, text);
  } catch {
    return null;
  }
}

export function isWhatsAppAppLink(url) {
  try {
    return new URL(String(url || "").trim()).protocol === "whatsapp:";
  } catch {
    return false;
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * דף מעבר קצר — פותח WhatsApp באפליקציה (Android intent + whatsapp://).
 */
export function whatsAppAppRedirectHtml(deepLink) {
  let phone = "";
  let text = "";
  try {
    const u = new URL(deepLink);
    phone = String(u.searchParams.get("phone") || "").replace(/\D/g, "");
    text = u.searchParams.get("text") || "";
  } catch {
    return null;
  }
  if (!phone) return null;

  const deepJson = JSON.stringify(deepLink);
  const textQ = text ? `&text=${encodeURIComponent(text)}` : "";
  const intentUrl = `intent://send/?phone=${phone}${textQ}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
  const intentJson = JSON.stringify(intentUrl);
  const safeDeep = escapeHtml(deepLink);

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>פותח WhatsApp</title>
</head>
<body style="font-family:system-ui,sans-serif;padding:2rem;text-align:center;color:#1f2937">
<p style="font-size:1rem;margin:0 0 1rem">פותח את WhatsApp…</p>
<script>
(function(){
  var deep = ${deepJson};
  var intent = ${intentJson};
  var ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) {
    window.location.href = intent;
    setTimeout(function(){ window.location.replace(deep); }, 600);
  } else {
    window.location.replace(deep);
  }
})();
</script>
<noscript><a href="${safeDeep}" style="color:#0a9396;font-weight:600">לחץ לפתיחת WhatsApp</a></noscript>
</body>
</html>`;
}
