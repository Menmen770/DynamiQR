import express from "express";
import SavedQr from "../models/SavedQr.js";
import { qrRedirectLimiter } from "../middleware/rateLimiters.js";
import { buildEncodedQrText } from "../utils/buildEncodedQrText.js";
import {
  resolveTargetFromSavedDoc,
  isValidSlug,
  normalizeSlugParam,
} from "../utils/dynamicQr.js";

const router = express.Router();
const COUNTRY_HEADER_KEYS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-country-code",
];

const PAUSED_HTML = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>קישור לא זמין</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem;text-align:center;">
<p>הקישור זמנית לא זמין.</p>
</body></html>`;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fallbackPayloadFromDoc(doc) {
  const type = doc?.qrType || "url";
  const inputs = doc?.qrInputs && typeof doc.qrInputs === "object" ? doc.qrInputs : {};
  const built = String(buildEncodedQrText(type, inputs) || "").trim();
  return built || null;
}

function payloadLandingHtml(payload) {
  const safe = escapeHtml(payload);
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>תוכן ה־QR</title>
<style>
body{font-family:system-ui,sans-serif;padding:1.25rem;max-width:36rem;margin:0 auto;line-height:1.5}
pre{white-space:pre-wrap;word-break:break-word;background:#f4f4f5;padding:1rem;border-radius:8px;font-size:0.85rem;direction:ltr;text-align:left}
button{margin-top:1rem;padding:0.5rem 1rem;border-radius:8px;border:0;background:#0d9488;color:#fff;font-weight:600;cursor:pointer}
.muted{color:#71717a;font-size:0.9rem;margin-bottom:0.75rem}
</style></head>
<body>
<p class="muted">סריקה העבירה לכאן את תוכן ה־QR הדינמי (למשל רשת Wi‑Fi או vCard). ניתן להעתיק את הטקסט למכשיר אחר.</p>
<pre id="p">${safe}</pre>
<button type="button" id="copy">העתק את התוכן</button>
<script>
document.getElementById("copy").addEventListener("click", function(){
  var t=document.getElementById("p").textContent;
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){alert("הועתק");});}
  else{var a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();try{document.execCommand("copy");alert("הועתק");}catch(e){}document.body.removeChild(a);}
});
</script>
</body>
</html>`;
}

function detectOsFromUserAgent(uaRaw) {
  const ua = String(uaRaw || "").toLowerCase();
  if (!ua) return "other";
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return "ios";
  }
  return "other";
}

function inferCountryCode(req) {
  for (const key of COUNTRY_HEADER_KEYS) {
    const v = String(req.headers[key] || "").trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(v)) return v;
  }
  const lang = String(req.headers["accept-language"] || "");
  const m = lang.match(/-[A-Za-z]{2}\b/);
  if (m) return m[0].slice(1).toUpperCase();
  return "UN";
}

router.get("/r/:slug", qrRedirectLimiter, async (req, res) => {
  const slugNorm = normalizeSlugParam(req.params.slug);
  if (!isValidSlug(slugNorm)) {
    return res.status(404).type("text/plain").send("Not found");
  }
  try {
    const doc = await SavedQr.findOne({ publicSlug: slugNorm }).lean();
    if (!doc) {
      return res.status(404).type("text/plain").send("Not found");
    }
    const isDynamic =
      doc.linkMode === "dynamic" ||
      ((!doc.linkMode || doc.linkMode === "") &&
        doc.publicSlug &&
        String(doc.dynamicTargetUrl || "").trim());
    if (!isDynamic) {
      return res.status(404).type("text/plain").send("Not found");
    }
    if (doc.redirectPaused) {
      return res.status(200).type("html").send(PAUSED_HTML);
    }
    const target = resolveTargetFromSavedDoc(doc);
    const scanEvent = {
      scannedAt: new Date(),
      os: detectOsFromUserAgent(req.headers["user-agent"]),
      countryCode: inferCountryCode(req),
    };
    const inc = await SavedQr.updateOne(
      { _id: doc._id },
      {
        $inc: { scanCount: 1 },
        $push: {
          scanEvents: {
            $each: [scanEvent],
            $slice: -2000,
          },
        },
      },
    );
    if (!inc.matchedCount) {
      console.warn("QR redirect: scanCount update matched 0 docs", doc._id);
    }
    if (target) {
      res.statusCode = 302;
      res.setHeader("Location", target);
      return res.end();
    }
    const fallback = fallbackPayloadFromDoc(doc);
    if (!fallback) {
      return res.status(404).type("text/plain").send("Not found");
    }
    return res.status(200).type("html").send(payloadLandingHtml(fallback));
  } catch (err) {
    console.error("QR redirect error:", err);
    return res.status(500).type("text/plain").send("Server error");
  }
});

export default router;
