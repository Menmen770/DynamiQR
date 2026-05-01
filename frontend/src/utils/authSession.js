const AUTH_TOKEN_STORAGE_KEY = "qr_access_token";

export function getAuthToken() {
  try {
    const raw = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    return raw && typeof raw === "string" ? raw.trim() : "";
  } catch {
    return "";
  }
}

export function setAuthToken(token) {
  const normalized = String(token || "").trim();
  if (!normalized) return;
  try {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, normalized);
  } catch {
    // ignore storage errors
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

