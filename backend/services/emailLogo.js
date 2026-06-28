import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_SOURCE = path.join(__dirname, "../assets/email/logo-full.png");
const LOGO_EMAIL = path.join(__dirname, "../assets/email/logo-email.png");

/** מזהה CID לתמונה inline — חייב להתאים ל-src ב-HTML */
export const EMAIL_LOGO_CID = "dynamiqr-logo@mail";

let logoBufferCache = null;

async function buildEmailLogoBuffer() {
  if (!fs.existsSync(LOGO_SOURCE)) return null;
  return sharp(LOGO_SOURCE)
    .resize(200, null, { withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
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

/** מחדש לוגו (רקע לבן) — לשימוש אחרי שינוי עיצוב */
export async function refreshEmailLogoCache() {
  logoBufferCache = null;
  if (fs.existsSync(LOGO_EMAIL)) fs.unlinkSync(LOGO_EMAIL);
  return getEmailLogoBuffer();
}

/** קובץ inline ל-nodemailer — מוצג בגוף המייל, לא כהורדה */
export async function getEmailLogoInlineAttachment() {
  const content = await getEmailLogoBuffer();
  if (!content) return null;
  return {
    filename: "dynamiqr-logo.png",
    content,
    cid: EMAIL_LOGO_CID,
    contentDisposition: "inline",
    contentType: "image/png",
  };
}
