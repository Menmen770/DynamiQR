import * as FileSystem from "expo-file-system/legacy";
import { Image } from "react-native";

const cache = new Map();

export async function loadSvgStringFromModule(assetModule) {
  const resolved = Image.resolveAssetSource(assetModule);
  if (!resolved?.uri) {
    throw new Error("SVG asset not found");
  }
  const { uri } = resolved;
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    const res = await fetch(uri);
    if (!res.ok) {
      throw new Error("Failed to load SVG asset");
    }
    return res.text();
  }
  return FileSystem.readAsStringAsync(uri);
}

/**
 * טוען SVG מה-bundle ומחזיר data URL לשליחה ל-API (כמו באתר).
 * ללא expo-asset — React Native Image.resolveAssetSource + קריאת טקסט.
 */
export async function svgModuleToDataUrl(assetModule) {
  if (cache.has(assetModule)) {
    return cache.get(assetModule);
  }
  const text = await loadSvgStringFromModule(assetModule);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  cache.set(assetModule, dataUrl);
  return dataUrl;
}

/** URI גולמי (שימוש נדיר) */
export function svgModuleToLocalUri(assetModule) {
  const resolved = Image.resolveAssetSource(assetModule);
  return resolved?.uri ?? null;
}
