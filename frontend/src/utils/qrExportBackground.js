import { createCanvasGradient } from "./qrGradients";

/**
 * Fills a canvas with the same background the user chose in the UI (solid / gradient / transparent).
 * Used for PNG export and sticker composite export.
 */
export function paintExportBackground(
  ctx,
  width,
  height,
  { bgColorMode, bgColor, bgGradient },
) {
  if (bgColorMode === "none") {
    ctx.clearRect(0, 0, width, height);
    return;
  }
  if (bgColorMode === "solid") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  if (bgColorMode === "gradient") {
    const gradient = createCanvasGradient(ctx, width, height, bgGradient);
    if (gradient) {
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      return;
    }
    ctx.fillStyle = bgColor || "#ffffff";
    ctx.fillRect(0, 0, width, height);
    return;
  }
  ctx.fillStyle = bgColor || "#ffffff";
  ctx.fillRect(0, 0, width, height);
}
