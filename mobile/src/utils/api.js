import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * כתובת ה-API ל-backend
 *
 * 1) העדף EXPO_PUBLIC_API_URL בקובץ .env בתיקיית mobile (למשל http://192.168.1.10:5000)
 *    — חובה כמעט תמיד במכשיר פיזי או כש־Expo במצב tunnel.
 * 2) או ערוך CUSTOM_IP למטה (IP המחשב ברשת המקומית).
 * 3) בלי זה, Expo ינסה hostUri — ב-tunnel זה *לא* המחשב שלך והבקשות ייתקעו/ייכשלו.
 */
const API_PORT = 5000;
/** @type {string|null} דוגמה: "192.168.1.34" — רק אם אין .env */
const CUSTOM_IP = null;

const AUTH_TOKEN_KEY = "dynamiqrAuthJwt";
const LEGACY_AUTH_TOKEN_KEY = "qrMasterAuthJwt";

function getEnvApiBaseUrl() {
  try {
    const u = process.env.EXPO_PUBLIC_API_URL;
    if (typeof u === "string" && u.trim()) {
      return u.trim().replace(/\/$/, "");
    }
  } catch (_) {}
  return null;
}

/** hostUri של Metro ב-tunnel הוא לא השרת שלך — לא להשתמש בו ל-API */
function isLikelyTunnelDevHost(host) {
  if (!host || typeof host !== "string") return false;
  const h = host.toLowerCase();
  return (
    h.includes("exp.direct") ||
    h.includes("ngrok") ||
    h.includes("ngrok-free") ||
    h.endsWith(".u.expo.dev") ||
    h === "u.expo.dev"
  );
}

function getHostFromExpo() {
  try {
    const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest?.hostUri;
    if (hostUri) {
      const host = hostUri.split(":")[0];
      if (host && host !== "localhost" && !host.startsWith("127.")) {
        if (isLikelyTunnelDevHost(host)) {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn(
              "[api] hostUri נראה כמו Expo tunnel — לא משתמשים בו ל-API. הגדר EXPO_PUBLIC_API_URL או CUSTOM_IP.",
            );
          }
          return null;
        }
        return host;
      }
    }
  } catch (_) {}
  return null;
}

export function getApiBaseUrl() {
  const fromEnv = getEnvApiBaseUrl();
  if (fromEnv) return fromEnv;

  const host =
    CUSTOM_IP ||
    getHostFromExpo() ||
    (Platform.OS === "android" ? "10.0.2.2" : "localhost");
  return `http://${host}:${API_PORT}`;
}

/** בסיס לקישור QR דינמי — חייב להיות נגיש למכשיר שסורק */
export function getDynamicQrRedirectBase() {
  try {
    const explicit = process.env.EXPO_PUBLIC_QR_BASE;
    if (typeof explicit === "string" && explicit.trim()) {
      return explicit.trim().replace(/\/$/, "");
    }
  } catch (_) {}
  return getApiBaseUrl();
}

export async function getStoredAuthToken() {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) return token;
    const legacy = await AsyncStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
    if (legacy) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, legacy);
      await AsyncStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
      return legacy;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setStoredAuthToken(token) {
  if (token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export async function clearStoredAuthToken() {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (_) {}
}

/**
 * fetch עם Authorization Bearer כשיש JWT (אימות יציב במובייל).
 */
export async function apiFetch(url, init = {}) {
  const baseHeaders =
    init.headers &&
    typeof init.headers === "object" &&
    !Array.isArray(init.headers)
      ? { ...init.headers }
      : {};
  const token = await getStoredAuthToken();
  if (token) {
    baseHeaders.Authorization = `Bearer ${token}`;
  }
  return fetch(url, {
    ...init,
    headers: baseHeaders,
    credentials: "include",
  });
}

const DEFAULT_FETCH_MS = 20000;

/**
 * Timeout לרשת — מונע טעינה אינסופית כשכתובת ה-API שגויה.
 * @param {number} [timeoutMs]
 */
export async function apiFetchWithTimeout(url, init = {}, timeoutMs = DEFAULT_FETCH_MS) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  const userSignal = init.signal;
  let onAbort;
  if (userSignal) {
    if (userSignal.aborted) {
      clearTimeout(tid);
      throw Object.assign(new Error("Aborted"), { name: "AbortError" });
    }
    onAbort = () => ctrl.abort();
    userSignal.addEventListener("abort", onAbort);
  }
  try {
    return await apiFetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(tid);
    if (userSignal && onAbort) {
      userSignal.removeEventListener("abort", onAbort);
    }
  }
}

/**
 * מפרסר JSON מתשובת fetch; אם הגוף לא JSON — הודעה סבירה למשתמש.
 */
export async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    const hint =
      response.status >= 500
        ? "השרת החזיר תשובה לא צפויה. ודא שה-backend רץ."
        : "תשובה לא תקינה מהשרת.";
    const err = new Error(hint);
    err.isParseError = true;
    throw err;
  }
}
