import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { BACKEND_URL } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_SOURCE = path.join(__dirname, "../assets/email/logo-full.png");
const LOGO_EMAIL = path.join(__dirname, "../assets/email/logo-email.png");

/** מזהה CID — בלי @ (תואם ל-Gmail / nodemailer) */
export const EMAIL_LOGO_CID = "dynamiqr-logo";

let logoBufferCache = null;

async function buildEmailLogoBuffer() {
  if (!fs.existsSync(LOGO_SOURCE)) return null;
  return sharp(LOGO_SOURCE)
    .resize(180, null, { withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export async function ensureEmailLogoFile() {
  if (fs.existsSync(LOGO_EMAIL)) return LOGO_EMAIL;
  const buffer = await buildEmailLogoBuffer();
  if (!buffer) return null;
  fs.writeFileSync(LOGO_EMAIL, buffer);
  return LOGO_EMAIL;
}

export async function getEmailLogoBuffer() {
  if (logoBufferCache) return logoBufferCache;

  try {
    if (fs.existsSync(LOGO_EMAIL)) {
      logoBufferCache = fs.readFileSync(LOGO_EMAIL);
      return logoBufferCache;
    }
    logoBufferCache = await buildEmailLogoBuffer();
    if (logoBufferCache) {
      fs.writeFileSync(LOGO_EMAIL, logoBufferCache);
    }
    return logoBufferCache;
  } catch (err) {
    console.error("[emailLogo] Logo load failed:", err.message);
    return null;
  }
}

/** URL ציבורי ללוגו — עובד ב-Gmail בלי קובץ מצורף */
export function getEmailLogoPublicUrl() {
  const base = String(BACKEND_URL || "").replace(/\/$/, "");
  if (!base || /localhost|127\.0\.0\.1/i.test(base)) {
    return null;
  }
  return `${base}/email-assets/logo.png`;
}

/** מחדש לוגו (רקע לבן) — אחרי שינוי עיצוב */
export async function refreshEmailLogoCache() {
  logoBufferCache = null;
  if (fs.existsSync(LOGO_EMAIL)) fs.unlinkSync(LOGO_EMAIL);
  return getEmailLogoBuffer();
}

/** CID inline — רק כשאין URL ציבורי (פיתוח מקומי) */
export async function getEmailLogoInlineAttachment() {
  const content = await getEmailLogoBuffer();
  if (!content) return null;
  return {
    filename: "logo.png",
    content,
    cid: EMAIL_LOGO_CID,
    contentDisposition: "inline",
    contentType: "image/png",
  };
}

/**
 * לוגו למייל: בפרודקשן URL ציבורי (ללא attachment), בפיתוח CID.
 */
export async function resolveEmailLogoForSend() {
  const publicUrl = getEmailLogoPublicUrl();
  if (publicUrl) {
    await ensureEmailLogoFile();
    return { logoUrl: publicUrl, attachment: null };
  }
  const attachment = await getEmailLogoInlineAttachment();
  return { logoUrl: null, attachment };
}
