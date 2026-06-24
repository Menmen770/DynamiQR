import { rateLimit } from "express-rate-limit";

const isRateLimitDisabled = () => process.env.RATE_LIMIT_DISABLED === "1";

function createLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isRateLimitDisabled(),
    handler: (_req, res) => {
      res.status(429).json({ error: message });
    },
  });
}

/** Safety net for all /api routes */
export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: "יותר מדי בקשות, נסה שוב מאוחר יותר",
});

/** Login, register, password change — brute-force protection */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "יותר מדי ניסיונות התחברות, המתן 15 דקות",
});

/** QR image generation — CPU-heavy public endpoint */
export const qrGenerateLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 30,
  message: "יותר מדי בקשות ליצירת QR, המתן דקה",
});

/** Public dynamic QR redirects */
export const qrRedirectLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 120,
  message: "יותר מדי בקשות לקישור זה, המתן דקה",
});
