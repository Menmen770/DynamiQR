const MAX_LOGO_BODY_CHARS = 900_000;

export function isSvgDataUrl(url) {
  return typeof url === "string" && /^data:image\/svg\+xml/i.test(url);
}

/** בודק שהלוגו לא יחרוג ממגבלת גוף הבקשה לשרת */
export function validateLogoPayloadSize(logoUrl) {
  if (!logoUrl || typeof logoUrl !== "string") return null;
  if (logoUrl.length > MAX_LOGO_BODY_CHARS) {
    return "התמונה גדולה מדי. בחר תמונה קטנה יותר או לוגו מוכן.";
  }
  return null;
}
