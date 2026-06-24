import crypto from "crypto";
import { buildEncodedQrText } from "./buildEncodedQrText.js";

export const MAX_TARGET_URL = 2048;

export function normalizeTargetUrl(raw) {
  const s = String(raw || "").trim();
  if (!s || s.length > MAX_TARGET_URL) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** יעד חוקי ל־HTTP Location (דפדפנים רבים תומכים גם ב־mailto / tel / sms). */
export function normalizeRedirectTarget(raw) {
  const s = String(raw || "").trim();
  if (!s || s.length > MAX_TARGET_URL) return null;
  try {
    const u = new URL(s);
    const p = u.protocol.toLowerCase();
    if (
      p === "http:" ||
      p === "https:" ||
      p === "mailto:" ||
      p === "tel:" ||
      p === "sms:"
    ) {
      return u.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function resolveTargetFromSavedDoc(doc) {
  const ex = String(doc?.dynamicTargetUrl || "").trim();
  if (ex) {
    const http = normalizeTargetUrl(ex);
    if (http) return http;
    const fromExplicit = normalizeRedirectTarget(ex);
    if (fromExplicit) return fromExplicit;
  }
  const type = doc?.qrType || "url";
  const inputs = doc?.qrInputs && typeof doc.qrInputs === "object" ? doc.qrInputs : {};
  const built = String(buildEncodedQrText(type, inputs) || "").trim();
  return normalizeRedirectTarget(built);
}

export function randomSlug() {
  return crypto.randomBytes(8).toString("hex");
}

export function isValidSlug(s) {
  return typeof s === "string" && /^[a-f0-9]{16}$/i.test(String(s).trim());
}

export function normalizeSlugParam(s) {
  return String(s || "").trim().toLowerCase();
}
