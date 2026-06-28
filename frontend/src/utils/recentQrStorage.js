/** מפתח אחיד להיסטוריית QR אחרונה (localStorage). */
export const DYNAMIQR_RECENT_KEY = "dynamiqrRecentHistory";

const LEGACY_RECENT_KEYS = ["qrCreatorRecentQrHistory", "qrMasterRecentHistory"];

export function loadRecentQrItems() {
  try {
    const raw =
      localStorage.getItem(DYNAMIQR_RECENT_KEY) ??
      LEGACY_RECENT_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export function saveRecentQrItems(items) {
  localStorage.setItem(DYNAMIQR_RECENT_KEY, JSON.stringify(items));
}
