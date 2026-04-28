/**
 * מקביל ל־frontend/src/utils/qrEncodedText.js — לחישוב יעד דינמי בשרת.
 */
function buildEncodedQrText(type, inputs) {
  const safe = inputs && typeof inputs === "object" ? inputs : {};
  const t = type || "url";

  switch (t) {
    case "url":
      return String(safe.url || "").trim();
    case "pdf":
      return String(safe.pdf || "").trim();
    case "whatsapp": {
      const phone = String(safe.whatsapp?.phone || "").replace(/\D/g, "");
      const msg =
        safe.whatsapp?.message != null ? String(safe.whatsapp.message) : "";
      if (!phone) return "";
      return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    }
    case "email": {
      const email = String(safe.email?.email || "").trim();
      if (!email) return "";
      const params = new URLSearchParams();
      if (safe.email?.subject) params.append("subject", String(safe.email.subject));
      if (safe.email?.message) params.append("body", String(safe.email.message));
      const q = params.toString();
      return `mailto:${email}${q ? `?${q}` : ""}`;
    }
    case "phone":
      return `tel:${String(safe.phone || "").trim()}`;
    case "sms": {
      const p = String(safe.sms?.phone || "").trim();
      if (!p) return "";
      const body = safe.sms?.message != null ? String(safe.sms.message) : "";
      return `sms:${p}?body=${encodeURIComponent(body)}`;
    }
    case "wifi": {
      const sec = String(safe.wifi?.security || "WPA");
      const ssid = String(safe.wifi?.ssid || "");
      const pass = String(safe.wifi?.password || "");
      return `WIFI:T:${sec};S:${ssid};P:${pass};;`;
    }
    case "contact": {
      const name = String(safe.contact?.name || "");
      const tel = String(safe.contact?.phone || "");
      const em = String(safe.contact?.email || "");
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${tel}\nEMAIL:${em}\nEND:VCARD`;
    }
    case "facebook":
      return `https://facebook.com/${String(safe.facebook || "").trim()}`;
    case "instagram":
      return `https://instagram.com/${String(safe.instagram || "").trim()}`;
    case "twitter":
      return `https://twitter.com/${String(safe.twitter || "").trim()}`;
    case "linkedin":
      return `https://linkedin.com/in/${String(safe.linkedin || "").trim()}`;
    case "youtube":
      return `https://youtube.com/@${String(safe.youtube || "").trim()}`;
    case "tiktok":
      return `https://tiktok.com/@${String(safe.tiktok || "").trim()}`;
    default:
      return String(safe.url || "").trim();
  }
}

module.exports = { buildEncodedQrText };
