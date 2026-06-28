import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { BACKEND_URL } from "../config/env.js";
import { buildVerificationEmailHtml } from "./emailTemplates.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const LOGO_EMAIL_PATH = path.join(
  __dirname,
  "../assets/email/logo-email.png",
);

const EMAIL_LOGO_CID = "dynamiqr-logo";
let logoBufferCache = null;

function getEmailLogoPublicUrl() {
  const base = String(BACKEND_URL || "").replace(/\/$/, "");
  if (!base || /localhost|127\.0\.0\.1/i.test(base)) return null;
  return `${base}/email-assets/logo.png`;
}

async function resolveEmailLogoForSend() {
  const publicUrl = getEmailLogoPublicUrl();
  if (publicUrl) {
    if (!fs.existsSync(LOGO_EMAIL_PATH)) {
      console.warn("[mailer] חסר backend/assets/email/logo-email.png");
    }
    return { logoUrl: publicUrl, attachment: null };
  }

  if (!logoBufferCache && fs.existsSync(LOGO_EMAIL_PATH)) {
    try {
      logoBufferCache = fs.readFileSync(LOGO_EMAIL_PATH);
    } catch (err) {
      console.error("[mailer] Logo load failed:", err.message);
    }
  }

  const attachment = logoBufferCache
    ? {
        filename: "dynamiqr-logo.png",
        content: logoBufferCache,
        cid: EMAIL_LOGO_CID,
        contentDisposition: "inline",
        contentType: "image/png",
        contentTransferEncoding: "base64",
      }
    : null;

  return { logoUrl: null, attachment };
}

let transport = null;
let transportKey = "";

function getSmtpConfig() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const service = process.env.SMTP_SERVICE || "gmail";
  return { user, pass, service };
}

export function isEmailConfigured() {
  const { user, pass } = getSmtpConfig();
  return Boolean(user && pass);
}

function buildTransportOptions() {
  const { user, pass, service } = getSmtpConfig();
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "1",
      auth: { user, pass },
    };
  }
  return { service, auth: { user, pass } };
}

function getTransport() {
  const { user, pass } = getSmtpConfig();
  const key = `${user || ""}:${pass || ""}`;
  if (transport && transportKey === key) return transport;
  transportKey = key;
  if (!user || !pass) {
    transport = null;
    return null;
  }
  transport = nodemailer.createTransport(buildTransportOptions());
  return transport;
}

/** בדיקת חיבור SMTP — לשימוש בהפעלת השרver */
export async function verifySmtpConnection() {
  const tx = getTransport();
  if (!tx) {
    return { ok: false, reason: "missing_config" };
  }
  try {
    await tx.verify();
    return { ok: true };
  } catch (err) {
    console.error("[mailer] SMTP verify failed:", err.message);
    return { ok: false, reason: "verify_failed", error: err.message };
  }
}

function getFromAddress() {
  return (
    process.env.SMTP_FROM ||
    process.env.MAIL_FROM ||
    `"דינמיקר" <${getSmtpConfig().user}>`
  );
}

/**
 * @param {{ to: string, fullName?: string, code: string, expiresMinutes?: number }} opts
 */
export async function sendVerificationEmail({
  to,
  fullName,
  code,
  expiresMinutes = 10,
}) {
  const tx = getTransport();
  if (!tx) {
    console.warn(
      "[mailer] ⚠ SMTP לא מוגדר ב-.env — המייל לא נשלח!",
    );
    console.warn(
      "[mailer] קוד אימות (פיתוח — העתק מהקונסול):",
      code,
      "→",
      to,
    );
    console.warn(
      "[mailer] הוסף ל-backend/.env: SMTP_USER + SMTP_PASS (Gmail App Password)",
    );
    return { devLogged: true, sent: false };
  }

  const { logoUrl, attachment } = await resolveEmailLogoForSend();
  const html = buildVerificationEmailHtml({
    fullName,
    code,
    expiresMinutes,
    logoUrl,
    logoCid: attachment?.cid ?? null,
  });
  const text = `קוד האימות שלך בדינמיקר: ${code}\nהקוד תקף ${expiresMinutes} דקות.`;

  try {
    await tx.verify();
  } catch (verifyErr) {
    console.error("[mailer] SMTP auth failed:", verifyErr.message);
    throw new Error(
      "הגדרות SMTP שגויות — בדוק SMTP_USER ו-SMTP_PASS ב-.env (Gmail App Password)",
    );
  }

  const info = await tx.sendMail({
    from: getFromAddress(),
    to,
    subject: "קוד אימות — דינמיקר",
    text,
    html,
    attachments: attachment ? [attachment] : [],
  });

  console.info(
    "[mailer] ✓ Verification email sent:",
    info.messageId,
    "| מ:",
    getSmtpConfig().user,
    "→ אל:",
    to,
  );
  if (process.env.NODE_ENV !== "production") {
    console.info("[mailer] קוד אימות (dev):", code, "→", to);
  }
  return { messageId: info.messageId, sent: true };
}
