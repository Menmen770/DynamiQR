import geoip from "geoip-lite";

const COUNTRY_HEADER_KEYS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-country-code",
];

/** IP אמיתי של הסורק (Cloudflare / Render). */
export function clientIpFromRequest(req) {
  const direct =
    req.headers["cf-connecting-ip"] ||
    req.headers["true-client-ip"];
  if (direct) {
    const ip = String(direct).trim();
    if (ip) return ip;
  }
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const first = String(xff).split(",")[0].trim();
    if (first) return first;
  }
  const ip = req.ip || req.socket?.remoteAddress || "";
  return String(ip).trim();
}

function countryFromHeaders(req) {
  for (const key of COUNTRY_HEADER_KEYS) {
    const v = String(req.headers[key] || "").trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(v) && v !== "XX" && v !== "T1") {
      return v;
    }
  }
  return null;
}

function countryFromGeoIp(ip) {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.")) {
    return null;
  }
  const geo = geoip.lookup(ip);
  const code = geo?.country ? String(geo.country).toUpperCase() : "";
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

/**
 * ניחוש אזור מ-Accept-Language — לא לוקח את המדינה הראשונה (למשל en-GB).
 * עדיפות ל-he / he-IL → IL.
 */
function countryFromAcceptLanguage(raw) {
  const lang = String(raw || "");
  if (!lang) return null;

  if (/\bhe(-IL)?\b/i.test(lang)) {
    return "IL";
  }

  const regions = [...lang.matchAll(/-([A-Za-z]{2})\b/g)].map((m) =>
    m[1].toUpperCase(),
  );
  if (regions.includes("IL")) {
    return "IL";
  }

  const unique = [...new Set(regions)];
  if (unique.length === 1) {
    return unique[0];
  }

  return null;
}

/** קוד מדינה ISO לסטטיסטיקת סריקה. */
export function inferCountryCode(req) {
  const fromHeader = countryFromHeaders(req);
  if (fromHeader) {
    return fromHeader;
  }

  const fromIp = countryFromGeoIp(clientIpFromRequest(req));
  if (fromIp) {
    return fromIp;
  }

  const fromLang = countryFromAcceptLanguage(req.headers["accept-language"]);
  if (fromLang) {
    return fromLang;
  }

  return "UN";
}
