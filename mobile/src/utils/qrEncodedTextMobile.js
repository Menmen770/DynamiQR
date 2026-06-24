import { getDynamicQrRedirectBase } from "./api";

/**
 * הטקסט שמקודד בפועל ב-QR — מקביל ל-buildEncodedQrText באתר.
 */
export function buildEncodedQrText(type, inputs) {
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
      const emailParams = new URLSearchParams();
      if (safe.email?.subject) {
        emailParams.append("subject", String(safe.email.subject));
      }
      if (safe.email?.message) {
        emailParams.append("body", String(safe.email.message));
      }
      const q = emailParams.toString();
      return `mailto:${email}${q ? `?${q}` : ""}`;
    }
    case "phone":
      return `tel:${String(safe.phone || "").trim()}`;
    case "sms": {
      const p = String(safe.sms?.phone || "").trim();
      if (!p) return "";
      const body =
        safe.sms?.message != null ? String(safe.sms.message) : "";
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

export const DEFAULT_QR_INPUTS = {
  url: "https://example.com",
  pdf: "",
  whatsapp: { phone: "", message: "" },
  email: { email: "", subject: "", message: "" },
  phone: "",
  sms: { phone: "", message: "" },
  wifi: { ssid: "", password: "", security: "WPA" },
  contact: { name: "", phone: "", email: "" },
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  youtube: "",
  tiktok: "",
};

export function createEmptyQrInputs() {
  return JSON.parse(JSON.stringify(DEFAULT_QR_INPUTS));
}

/** טקסט לקידוד QR לשורה שמורה (סטטי או קישור קצר דינמי) */
export function effectiveSavedQrEncodedText(row) {
  if (row?.linkMode === "dynamic" && row?.publicSlug) {
    const base = getDynamicQrRedirectBase().replace(/\/$/, "");
    const slug = String(row.publicSlug).trim().toLowerCase();
    return `${base}/api/r/${slug}`;
  }
  const fromValue = String(row?.qrValue || "").trim();
  if (fromValue) return fromValue;
  return String(buildEncodedQrText(row?.qrType, row?.qrInputs) || "").trim();
}
