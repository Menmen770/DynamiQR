/**
 * כתובת ה-API – משתנה סביבה או אותו מקור כמו הפרונט (עם proxy ב־Vite ל־:5000).
 * לפרודקשן: הגדר VITE_API_URL לכתובת הבאקאנד המלאה.
 */
const envApi = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const API_BASE =
  envApi ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "http://127.0.0.1:5000");

/**
 * כתובת בסיס לקישור הקצר ב-QR דינמי (חייבת להיות נגישה למכשיר שסורק — לא localhost של המכשיר).
 * VITE_PUBLIC_QR_BASE — כתובת מלאה לבאקאנד (למשל https://api.example.com או http://192.168.1.10:5000).
 * בפיתוח ללא הגדרה: אותו hostname כמו הדפדפן + פורט 5000 (שרת Node), לא פורט Vite.
 */
export function getDynamicQrRedirectBase() {
  const explicit = (import.meta.env.VITE_PUBLIC_QR_BASE || "")
    .trim()
    .replace(/\/$/, "");
  if (explicit) return explicit;
  const apiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  if (apiUrl) return apiUrl;
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (import.meta.env.DEV) {
      return `${protocol}//${hostname}:5000`;
    }
    return `${window.location.protocol}//${window.location.host}`;
  }
  return "http://127.0.0.1:5000";
}
