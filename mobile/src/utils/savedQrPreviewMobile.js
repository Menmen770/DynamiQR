import { PixelRatio } from "react-native";
import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  parseJsonResponse,
} from "./api";
import { effectiveSavedQrEncodedText } from "./qrEncodedTextMobile";
import {
  STICKER_QR_INNER_SCALE,
  STICKER_QR_NORMALIZED_RECT,
} from "./qrConstantsMobile";
import {
  DEFAULT_QR_GRADIENT,
  getGradientPrimaryColor,
} from "./qrGradientsMobile";

const MAX_LOGO_FOR_PREVIEW = 400_000;

export function normalizeErrorCorrectionLevel(level) {
  return ["L", "M", "Q", "H"].includes(level) ? level : "Q";
}

/** רזולוציית PNG לשרת — מספיקה לתצוגה חדה בכרטיס. */
export function getSavedQrPreviewPixelSize(displayPx = 148, stickerType = "none") {
  const dpr = PixelRatio.get();
  const withSticker = stickerType && stickerType !== "none";
  const slotFrac = withSticker
    ? STICKER_QR_NORMALIZED_RECT.width * STICKER_QR_INNER_SCALE
    : 1;
  const qrDisplayPx = Math.max(64, displayPx * slotFrac);
  return Math.min(800, Math.round(qrDisplayPx * dpr * 2));
}

function normalizeBgColorMode(mode) {
  return mode === "none" || mode === "solid" || mode === "gradient"
    ? mode
    : "gradient";
}

/** מקביל ל-buildBgForApi באתר */
function buildBgForApi(style) {
  const stickerType = style.stickerType || "none";
  const bgColorMode = normalizeBgColorMode(style.bgColorMode || "solid");
  const bg = style.bgColor || "#ffffff";
  if (stickerType !== "none") return "transparent";
  if (bgColorMode === "gradient" || bgColorMode === "none") {
    return "transparent";
  }
  return bg;
}

/**
 * גוף בקשה ל-generate-qr — מיושר עם frontend/src/utils/savedQrPreview.js
 * (לוגו SVG מעובד בשרת לפני הטמעה ב-QR).
 */
export function buildGenerateQrBodyFromSavedRow(row, options = {}) {
  const style = row?.style && typeof row.style === "object" ? row.style : {};
  const text = effectiveSavedQrEncodedText(row);
  if (!text) return null;

  const fg = style.fgColor || "#000000";
  const qrColorMode = style.qrColorMode || "solid";
  const dotsGradient = style.dotsGradient || DEFAULT_QR_GRADIENT;
  const dotsType = style.dotsType || "square";
  const cornersType = style.cornersType || "square";
  const logoShape = style.logoShape || "square";
  const errorCorrectionLevel = normalizeErrorCorrectionLevel(
    style.errorCorrectionLevel,
  );
  const logoInsetScale = Number(style.logoInsetScale) || 1;

  let logoUrl = typeof style.logoUrl === "string" ? style.logoUrl : "";
  if (logoUrl.length > MAX_LOGO_FOR_PREVIEW) {
    logoUrl = "";
  }

  const pixelSize =
    options.width ??
    getSavedQrPreviewPixelSize(148, style.stickerType || "none");

  const body = {
    text,
    width: pixelSize,
    color:
      qrColorMode === "gradient"
        ? getGradientPrimaryColor(dotsGradient, fg)
        : fg,
    bgColor: buildBgForApi(style),
    dotsType,
    cornersType,
    logoShape,
    errorCorrectionLevel,
  };
  if (qrColorMode === "gradient") {
    body.dotsGradient = dotsGradient;
  }
  if (logoUrl) {
    body.image = logoUrl;
    body.logoInsetScale = logoInsetScale;
  }

  return body;
}

/**
 * שכבת QR לתצוגה (PNG מ-API). סטיקר + רקע — ב-QrPreviewComposite כמו במחולל.
 */
export async function getSavedQrPreviewDataUrl(row, options = {}) {
  const body = buildGenerateQrBodyFromSavedRow(row, options);
  if (!body) return "";

  try {
    const response = await apiFetchWithTimeout(
      `${getApiBaseUrl()}/api/generate-qr`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      30000,
    );
    const data = await parseJsonResponse(response);
    if (!response.ok) return "";
    return data.qrImage || "";
  } catch {
    return "";
  }
}
