import {
  getStickerOverlayUrl,
  isImageStickerId,
  STICKER_QR_NORMALIZED_RECT,
} from "../assets/stickerAssets";
import { drawStickerImageComposite } from "./stickerCompose";
import {
  getPresetRasterInsetForDataUrl,
  isPresetLogoDataUrl,
} from "./presetBrandLogos";
import { isSvgDataUrl, rasterizeSvgDataUrlToPng } from "./rasterizeSvgLogo";
import { effectiveSavedQrEncodedText } from "./qrEncodedText";
import { getEffectBackground } from "./qrConstants";
import { paintExportBackground } from "./qrExportBackground";

const MAX_LOGO_FOR_PREVIEW = 400_000;

function buildBgForApi(style) {
  const stickerType = style.stickerType || "none";
  const bgColorMode = style.bgColorMode || "solid";
  const bg = style.bgColor || "#ffffff";
  if (stickerType !== "none") return "transparent";
  if (bgColorMode === "effect" || bgColorMode === "none") return "transparent";
  return bg;
}

/**
 * מצייר מאחורי ה-QR את אותו רקע כמו במחולל (צבע / אפקט / לבן כשהמצב "ללא רקע").
 */
function compositeDataUrlOnSavedStyleBackground(qrDataUrl, style) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) {
          resolve(qrDataUrl);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { alpha: true });
        const bgColorMode = style.bgColorMode || "solid";
        if (bgColorMode === "none") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
        } else {
          paintExportBackground(ctx, w, h, {
            bgColorMode,
            bgColor: style.bgColor || "#ffffff",
            bgEffect: style.bgEffect || "none",
            getEffectBackground,
          });
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(qrDataUrl);
      }
    };
    img.onerror = () => resolve(qrDataUrl);
    img.src = qrDataUrl;
  });
}

function compositeStickerPreview(qrDataUrl, stickerType, fgColor) {
  return new Promise((resolve) => {
    const overlayUrl = getStickerOverlayUrl(stickerType);
    if (!overlayUrl || !isImageStickerId(stickerType)) {
      resolve(qrDataUrl);
      return;
    }
    const qrImg = new Image();
    const overlayImg = new Image();
    let qrOk = false;
    let ovOk = false;
    const run = () => {
      if (!qrOk || !ovOk) return;
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { alpha: true });
        drawStickerImageComposite(
          ctx,
          qrImg,
          overlayImg,
          fgColor,
          STICKER_QR_NORMALIZED_RECT,
        );
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(qrDataUrl);
      }
    };
    qrImg.onload = () => {
      qrOk = true;
      run();
    };
    overlayImg.onload = () => {
      ovOk = true;
      run();
    };
    qrImg.onerror = () => resolve(qrDataUrl);
    overlayImg.onerror = () => resolve(qrDataUrl);
    qrImg.src = qrDataUrl;
    overlayImg.src = overlayUrl;
  });
}

/**
 * מחזיר data URL לתצוגת כרטיסייה (שרת generate-qr + מדבקה בצד לקוח אם צריך).
 */
export async function getSavedQrPreviewDataUrl(row, apiBase) {
  const style = row?.style && typeof row.style === "object" ? row.style : {};
  const text = effectiveSavedQrEncodedText(row, apiBase);
  if (!text) return "";

  const fg = style.fgColor || "#000000";
  const dotsType = style.dotsType || "square";
  const cornersType = style.cornersType || "square";
  const logoShape = style.logoShape || "square";
  const stickerType = style.stickerType || "none";

  let logoUrl = typeof style.logoUrl === "string" ? style.logoUrl : "";
  if (logoUrl.length > MAX_LOGO_FOR_PREVIEW) {
    logoUrl = "";
  }
  if (logoUrl && isSvgDataUrl(logoUrl)) {
    try {
      const inset = isPresetLogoDataUrl(logoUrl)
        ? getPresetRasterInsetForDataUrl(logoUrl)
        : 1;
      logoUrl = await rasterizeSvgDataUrlToPng(logoUrl, { insetScale: inset });
    } catch {
      logoUrl = "";
    }
  }

  const body = {
    text,
    color: fg,
    bgColor: buildBgForApi(style),
    dotsType,
    cornersType,
    logoShape,
  };
  if (logoUrl) body.image = logoUrl;

  const res = await fetch(`${apiBase}/api/generate-qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return "";
  const data = await res.json().catch(() => ({}));
  let qrImage = data.qrImage || "";
  if (!qrImage) return "";

  if (stickerType !== "none") {
    qrImage = await compositeStickerPreview(qrImage, stickerType, fg);
  }

  return compositeDataUrlOnSavedStyleBackground(qrImage, style);
}

export function downloadDataUrlPng(dataUrl, filename) {
  if (!dataUrl || !String(dataUrl).startsWith("data:")) return;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename || "qr-code.png";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
