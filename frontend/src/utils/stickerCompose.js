/**
 * Compose QR + tinted frame overlay (monochrome frame on transparent hole).
 */
import { paintExportBackground } from "./qrExportBackground";
import { createCanvasGradient } from "./qrGradients";

/** QR drawn smaller inside the hole so the frame graphic reads larger (same overlay size). */
export const STICKER_QR_INNER_SCALE = 0.78;

// פונקציה שמכניסה תמונה לתוך מלבן ושומרת על הפרופורציות שלה
/** Draw image scaled with "cover" into dx,dy,dw,dh */
export function drawImageCover(ctx, img, dx, dy, dw, dh) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const ir = iw / ih;
  const hr = dw / dh;
  let sx;
  let sy;
  let sw;
  let sh;
  if (ir > hr) {
    sh = ih;
    sw = sh * hr;
    sx = (iw - sw) / 2;
    sy = 0;
  } else {
    sw = iw;
    sh = sw / hr;
    sx = 0;
    sy = (ih - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} qrImg
 * @param {HTMLImageElement} overlayImg
 * @param {{ color: string, gradient?: null|object }} ink - sticker tint that follows QR color/gradient
 * @param {{ x: number, y: number, width: number, height: number }} normRect - STICKER_QR_NORMALIZED_RECT
 * @param {null|{ bgColorMode: string, bgColor: string, bgGradient?: object }} exportBgState — if set (download), paints chosen background; if null (preview), transparent outside frame
 */

export function drawStickerImageComposite(
  ctx,
  qrImg,
  overlayImg,
  ink,
  normRect,
  exportBgState = null,
) {
  const W = overlayImg.naturalWidth || overlayImg.width;
  const H = overlayImg.naturalHeight || overlayImg.height;
  const canvas = ctx.canvas;
  canvas.width = W;
  canvas.height = H;

  const hx = normRect.x * W;
  const hy = normRect.y * H;
  const hw = normRect.width * W;
  const hh = normRect.height * H;

  const cx = hx + hw / 2;
  const cy = hy + hh / 2;
  const qw = hw * STICKER_QR_INNER_SCALE;
  const qh = hh * STICKER_QR_INNER_SCALE;
  const qx = cx - qw / 2;
  const qy = cy - qh / 2;

  if (exportBgState) {
    paintExportBackground(ctx, W, H, exportBgState);
  } else {
    /* Preview: transparent outside the frame; QR from API uses transparent bg */
    ctx.clearRect(0, 0, W, H);
  }

  drawImageCover(ctx, qrImg, qx, qy, qw, qh);

  const tint = document.createElement("canvas");
  tint.width = W;
  tint.height = H;
  const tctx = tint.getContext("2d");
  const tintGradient = ink?.gradient
    ? createCanvasGradient(tctx, W, H, ink.gradient)
    : null;
  tctx.fillStyle = tintGradient || ink?.color || "#000000";
  tctx.fillRect(0, 0, W, H);
  tctx.globalCompositeOperation = "destination-in";
  tctx.drawImage(overlayImg, 0, 0);
  tctx.globalCompositeOperation = "source-over";
  ctx.drawImage(tint, 0, 0);
}
