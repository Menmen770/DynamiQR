import { createCanvas, loadImage } from "canvas";
import sharp from "sharp";

const SVG_DATA_RE = /^data:image\/svg\+xml/i;
const MAX_LOGO_DIM = 512;

export function isSvgDataUrl(url) {
  return typeof url === "string" && SVG_DATA_RE.test(url);
}

function decodeSvgDataUrl(svgDataUrl) {
  const comma = svgDataUrl.indexOf(",");
  if (comma === -1) return "";
  const header = svgDataUrl.slice(0, comma);
  const rest = svgDataUrl.slice(comma + 1);
  if (header.includes("base64")) {
    try {
      return Buffer.from(rest.replace(/\s/g, ""), "base64").toString("utf8");
    } catch {
      return "";
    }
  }
  try {
    return decodeURIComponent(rest);
  } catch {
    return "";
  }
}

async function applyInsetScale(pngBuffer, insetScale) {
  const inset = Math.min(1, Math.max(0.1, Number(insetScale) || 1));
  if (inset >= 0.999) return pngBuffer;

  const meta = await sharp(pngBuffer).metadata();
  const tw = meta.width || MAX_LOGO_DIM;
  const th = meta.height || MAX_LOGO_DIM;
  const dw = Math.max(1, Math.round(tw * inset));
  const dh = Math.max(1, Math.round(th * inset));
  const resized = await sharp(pngBuffer)
    .resize(dw, dh, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: tw,
      height: th,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: resized,
        left: Math.floor((tw - dw) / 2),
        top: Math.floor((th - dh) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function rasterizeSvgWithSharp(svgDataUrl, insetScale) {
  const svgMarkup = decodeSvgDataUrl(svgDataUrl);
  if (!svgMarkup.trim()) {
    throw new Error("SVG markup empty");
  }
  let pngBuffer = await sharp(Buffer.from(svgMarkup), { density: 144 })
    .resize(MAX_LOGO_DIM, MAX_LOGO_DIM, {
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  pngBuffer = await applyInsetScale(pngBuffer, insetScale);
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}

async function rasterizeSvgWithCanvas(svgDataUrl, insetScale) {
  const svgMarkup = decodeSvgDataUrl(svgDataUrl);
  const img = await loadImage(svgDataUrl);
  let w = img.width;
  let h = img.height;
  if (svgMarkup) {
    const vb = svgMarkup.match(/viewBox\s*=\s*["']([^"']+)["']/i);
    if (vb) {
      const nums = vb[1].trim().split(/[\s,]+/).map((n) => parseFloat(n, 10));
      if (nums.length >= 4 && nums[2] > 0 && nums[3] > 0) {
        w = nums[2];
        h = nums[3];
      }
    }
  }
  if (!w || !h || (w === 300 && h === 150)) {
    w = w || 512;
    h = h || 512;
  }
  const scale = Math.min(MAX_LOGO_DIM / w, MAX_LOGO_DIM / h, 1);
  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));
  const canvas = createCanvas(tw, th);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, tw, th);
  const inset = Math.min(1, Math.max(0.1, Number(insetScale) || 1));
  if (inset < 1) {
    const dw = tw * inset;
    const dh = th * inset;
    ctx.drawImage(img, (tw - dw) / 2, (th - dh) / 2, dw, dh);
  } else {
    ctx.drawImage(img, 0, 0, tw, th);
  }
  return canvas.toDataURL("image/png");
}

/**
 * @param {string} svgDataUrl
 * @param {{ insetScale?: number }} [options]
 * @returns {Promise<string>} data:image/png;base64,...
 */
export async function rasterizeSvgDataUrlToPng(svgDataUrl, options = {}) {
  if (!isSvgDataUrl(svgDataUrl)) {
    return svgDataUrl;
  }
  const insetScale = options.insetScale ?? 1;
  try {
    return await rasterizeSvgWithSharp(svgDataUrl, insetScale);
  } catch (sharpErr) {
    try {
      return await rasterizeSvgWithCanvas(svgDataUrl, insetScale);
    } catch (canvasErr) {
      throw new Error(
        sharpErr?.message || canvasErr?.message || "SVG rasterize failed",
      );
    }
  }
}
