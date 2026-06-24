import jwt from "jsonwebtoken";

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET ||
    "dev-jwt-secret-change-me"
  );
}

export function signAccessToken(userId) {
  return jwt.sign({ sub: String(userId) }, getJwtSecret(), {
    expiresIn: "30d",
  });
}

/**
 * @returns {string|null} Mongo user id string
 */
export function verifyAccessToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const payload = jwt.verify(token.trim(), getJwtSecret());
    const sub = payload.sub;
    return typeof sub === "string" && sub ? sub : null;
  } catch {
    return null;
  }
}

/**
 * Session cookie (אתר) או Bearer JWT (אפליקציה).
 * @returns {string|null}
 */
export function getUserIdFromRequest(req) {
  if (req.session && req.session.userId) {
    return req.session.userId;
  }
  const raw = req.headers.authorization;
  if (raw && typeof raw === "string" && raw.startsWith("Bearer ")) {
    return verifyAccessToken(raw.slice(7));
  }
  return null;
}
