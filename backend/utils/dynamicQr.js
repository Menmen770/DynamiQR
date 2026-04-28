const crypto = require("crypto");
const { buildEncodedQrText } = require("./buildEncodedQrText");

const MAX_TARGET_URL = 2048;

function normalizeTargetUrl(raw) {
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

function resolveTargetFromSavedDoc(doc) {
  const explicit = normalizeTargetUrl(doc?.dynamicTargetUrl);
  if (explicit) return explicit;
  const type = doc?.qrType || "url";
  const inputs = doc?.qrInputs && typeof doc.qrInputs === "object" ? doc.qrInputs : {};
  const built = String(buildEncodedQrText(type, inputs) || "").trim();
  return normalizeTargetUrl(built);
}

function randomSlug() {
  return crypto.randomBytes(8).toString("hex");
}

function isValidSlug(s) {
  return typeof s === "string" && /^[a-f0-9]{16}$/i.test(String(s).trim());
}

function normalizeSlugParam(s) {
  return String(s || "").trim().toLowerCase();
}

module.exports = {
  normalizeTargetUrl,
  resolveTargetFromSavedDoc,
  randomSlug,
  isValidSlug,
  normalizeSlugParam,
  MAX_TARGET_URL,
};
