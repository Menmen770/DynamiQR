import { QRCodeStyling } from "qr-code-styling/lib/qr-code-styling.common.js";
import nodeCanvas from "canvas";
import { JSDOM } from "jsdom";
import {
  isSvgDataUrl,
  rasterizeSvgDataUrlToPng,
} from "../utils/rasterizeSvgDataUrl.js";

function clamp01(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(1, Math.max(0, num));
}

function hexToRgb(hex) {
  const value = String(hex || "").trim();
  const match = value.match(/^#([0-9a-f]{6})$/i);
  if (!match) return null;
  const raw = match[1];
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixHexColors(a, b, ratio = 0.5) {
  const colorA = hexToRgb(a);
  const colorB = hexToRgb(b);
  if (!colorA || !colorB) return a || b || "#000000";
  const t = clamp01(ratio);
  return rgbToHex({
    r: colorA.r + (colorB.r - colorA.r) * t,
    g: colorA.g + (colorB.g - colorA.g) * t,
    b: colorA.b + (colorB.b - colorA.b) * t,
  });
}

function getGradientAnchorColor(dotsGradient, fallback = "#000000") {
  const stops = Array.isArray(dotsGradient?.colorStops)
    ? dotsGradient.colorStops.filter((stop) => stop && stop.color)
    : [];
  if (!stops.length) return fallback;
  if (stops.length === 1) return stops[0].color || fallback;

  const sorted = [...stops].sort((a, b) => clamp01(a.offset) - clamp01(b.offset));
  const first = sorted[0]?.color || fallback;
  const last = sorted[sorted.length - 1]?.color || fallback;
  return mixHexColors(first, last, 0.45);
}

/** חור שקוף במרכז בלי תמונת לוגו — למי שרוצה למלא בעצמו */
async function applyCutoutOnly(qrBuffer, logoShape = "square") {
  const qrImage = await nodeCanvas.loadImage(qrBuffer);
  const canvas = nodeCanvas.createCanvas(qrImage.width, qrImage.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(qrImage, 0, 0);

  const centerX = qrImage.width / 2;
  const centerY = qrImage.height / 2;
  const cutoutSize = Math.min(qrImage.width, qrImage.height) * 0.38;

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  if (logoShape === "circle") {
    ctx.arc(centerX, centerY, cutoutSize / 2, 0, Math.PI * 2);
  } else {
    ctx.rect(
      centerX - cutoutSize / 2,
      centerY - cutoutSize / 2,
      cutoutSize,
      cutoutSize,
    );
  }
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer("image/png");
}

async function addLogoWithCutout(
  qrBuffer,
  imageSource,
  logoShape = "square",
  logoInsetScale = 1,
) {
  const qrImage = await nodeCanvas.loadImage(qrBuffer);
  const canvas = nodeCanvas.createCanvas(qrImage.width, qrImage.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(qrImage, 0, 0);

  const centerX = qrImage.width / 2;
  const centerY = qrImage.height / 2;
  const cutoutSize = Math.min(qrImage.width, qrImage.height) * 0.38;
  const insetMul = Math.min(
    1,
    Math.max(0.1, Number(logoInsetScale) || 1),
  );
  const logoSize = cutoutSize * 0.68 * insetMul;

  try {
    const logoImage = await nodeCanvas.loadImage(imageSource);
    const sourceSize = Math.min(logoImage.width, logoImage.height);
    const sourceX = (logoImage.width - sourceSize) / 2;
    const sourceY = (logoImage.height - sourceSize) / 2;

    if (logoShape === "overlay") {
      const overlaySize = Math.min(qrImage.width, qrImage.height) * 0.22;
      ctx.drawImage(
        logoImage,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        centerX - overlaySize / 2,
        centerY - overlaySize / 2,
        overlaySize,
        overlaySize,
      );
      return canvas.toBuffer("image/png");
    }

    /* חור שקוף — הרקע שמאחורי ה-QR (בתצוגה) ייראה דרך השקיפות */
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    if (logoShape === "circle") {
      ctx.arc(centerX, centerY, cutoutSize / 2, 0, Math.PI * 2);
    } else {
      ctx.rect(
        centerX - cutoutSize / 2,
        centerY - cutoutSize / 2,
        cutoutSize,
        cutoutSize,
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    ctx.drawImage(
      logoImage,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      centerX - logoSize / 2,
      centerY - logoSize / 2,
      logoSize,
      logoSize,
    );
  } catch (logoError) {
    const err = new Error("לא ניתן לטעון את הלוגו לתוך ה-QR");
    err.statusCode = 400;
    err.cause = logoError;
    throw err;
  }

  return canvas.toBuffer("image/png");
}

/**
 * מחזיר data URL של PNG לפי גוף הבקשה (כמו ב־POST /api/generate-qr).
 */
async function generateQrDataUrl(body) {
  const {
    text,
    color,
    bgColor,
    dotsType = "square",
    cornersType = "square",
    dotsGradient = null,
    bgGradient = null,
    image = null,
    logoShape = "square",
    errorCorrectionLevel = "Q",
    logoInsetScale = 1,
  } = body;

  if (!text) {
    const err = new Error("Text is required");
    err.statusCode = 400;
    throw err;
  }

  const hasDotsGradient =
    !!dotsGradient && typeof dotsGradient === "object";
  const cornerColor = hasDotsGradient
    ? getGradientAnchorColor(dotsGradient, color || "#000000")
    : color || "#000000";

  const dotsOptions = {
    type: dotsType,
  };
  if (!hasDotsGradient) {
    dotsOptions.color = color || "#000000";
  }
  if (hasDotsGradient) {
    dotsOptions.gradient = dotsGradient;
  }

  const backgroundOptions = {
    color: bgColor === "transparent" ? "rgba(0,0,0,0)" : bgColor || "#FFFFFF",
  };
  if (bgGradient) {
    backgroundOptions.gradient = bgGradient;
  }

  const size = Math.min(
    1200,
    Math.max(200, Math.round(Number(body.width) || 400)),
  );

  const options = {
    width: size,
    height: size,
    type: "png",
    data: text,
    margin: 10,
    jsdom: JSDOM,
    nodeCanvas: nodeCanvas,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: errorCorrectionLevel,
    },
    dotsOptions: dotsOptions,
    backgroundOptions: backgroundOptions,
    cornersSquareOptions: {
      type: cornersType,
      color: cornerColor,
    },
    cornersDotOptions: {
      type: cornersType,
      color: cornerColor,
    },
  };

  const qrCode = new QRCodeStyling(options);
  const qrBuffer = await qrCode.getRawData("png");
  let finalBuffer = qrBuffer;

  if (image) {
    let imageForLogo = image;
    if (isSvgDataUrl(image)) {
      imageForLogo = await rasterizeSvgDataUrlToPng(image, {
        insetScale: logoInsetScale,
      });
    }
    finalBuffer = await addLogoWithCutout(
      qrBuffer,
      imageForLogo,
      logoShape,
      logoInsetScale,
    );
  } else if (logoShape === "square" || logoShape === "circle") {
    finalBuffer = await applyCutoutOnly(qrBuffer, logoShape);
  }

  const base64 = finalBuffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}

export {
  addLogoWithCutout,
  applyCutoutOnly,
  generateQrDataUrl,
};
