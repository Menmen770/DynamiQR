import crypto from "crypto";

/** קוד אימות בן 6 ספרות (100000–999999) */
export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashVerificationCode(code) {
  return crypto.createHash("sha256").update(String(code).trim()).digest("hex");
}

export function verifyCodeHash(code, storedHash) {
  if (!code || !storedHash) return false;
  return hashVerificationCode(code) === storedHash;
}

export function verificationExpiryDate(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isVerificationExpired(expiresAt) {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
}
