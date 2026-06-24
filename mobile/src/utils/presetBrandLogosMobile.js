import { PRESET_BRAND_MODULES } from "./presetLogosMobile";
import { svgModuleToDataUrl } from "./svgDataUrlFromModule";

let registryCache = null;

async function ensureRegistry() {
  if (registryCache) return registryCache;
  const rows = await Promise.all(
    PRESET_BRAND_MODULES.map(async (p) => ({
      id: p.id,
      dataUrl: await svgModuleToDataUrl(p.module),
      rasterInset: p.rasterInset ?? 1,
    })),
  );
  registryCache = rows;
  return rows;
}

export async function isPresetLogoDataUrl(url) {
  if (!url || typeof url !== "string") return false;
  const rows = await ensureRegistry();
  return rows.some((p) => p.dataUrl === url);
}

export async function getPresetRasterInsetForDataUrl(url) {
  const rows = await ensureRegistry();
  const row = rows.find((p) => p.dataUrl === url);
  return row?.rasterInset ?? 1;
}
