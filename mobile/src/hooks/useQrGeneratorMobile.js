import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  parseJsonResponse,
} from "../utils/api";
import { svgModuleToDataUrl } from "../utils/svgDataUrlFromModule";

const RECENT_QR_KEY = "qrMasterRecentHistory";
const DEBOUNCE_MS = 450;

export function useQrGeneratorMobile() {
  const [url, setUrl] = useState("https://example.com");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgColorMode, setBgColorMode] = useState("solid");
  const [bgEffect, setBgEffect] = useState("none");
  const [dotsType, setDotsType] = useState("square");
  const [cornersType, setCornersType] = useState("square");
  const [stickerType, setStickerType] = useState("none");
  const [logoShape, setLogoShape] = useState("square");
  const [logoInputMode, setLogoInputMode] = useState("preset");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoInsetScale, setLogoInsetScale] = useState(1);
  const [logoLoadingPreset, setLogoLoadingPreset] = useState(false);

  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  const generateQr = useCallback(async () => {
    const text = String(url || "").trim();
    if (!text) {
      setQrImage(null);
      setError("");
      return;
    }

    const reqId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    const bgForAPI =
      stickerType !== "none"
        ? "transparent"
        : bgColorMode === "effect" || bgColorMode === "none"
          ? "transparent"
          : bgColor;

    const body = {
      text,
      color: fgColor,
      bgColor: bgForAPI,
      dotsType,
      cornersType,
      logoShape,
    };

    if (logoUrl) {
      body.image = logoUrl;
      body.logoInsetScale = logoInsetScale;
    }

    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/generate-qr`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        45000,
      );

      if (reqId !== requestIdRef.current) return;

      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || "היצירה נכשלה");
      }
      if (!data?.qrImage) {
        throw new Error("אין תמונה בתשובה");
      }
      if (reqId !== requestIdRef.current) return;
      setQrImage(data.qrImage);

      try {
        const entry = {
          id: Date.now(),
          type: "url",
          value: text,
          createdAt: new Date().toISOString(),
        };
        const raw = await AsyncStorage.getItem(RECENT_QR_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        const deduped = existing.filter(
          (item) => !(item.type === entry.type && item.value === entry.value),
        );
        await AsyncStorage.setItem(
          RECENT_QR_KEY,
          JSON.stringify([entry, ...deduped].slice(0, 8)),
        );
      } catch (_) {
        /* ignore */
      }
    } catch (e) {
      if (e?.name === "AbortError") return;
      if (reqId !== requestIdRef.current) return;
      setError(e.message || "נכשל ביצירת קוד QR");
      setQrImage(null);
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [
    url,
    fgColor,
    bgColor,
    bgColorMode,
    bgEffect,
    dotsType,
    cornersType,
    stickerType,
    logoShape,
    logoUrl,
    logoInsetScale,
  ]);

  useEffect(() => {
    const t = setTimeout(() => {
      generateQr();
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [generateQr]);

  const selectPresetLogo = useCallback(async (preset) => {
    const moduleRef = preset?.module ?? preset;
    const inset =
      preset && typeof preset === "object" && "rasterInset" in preset
        ? preset.rasterInset
        : 1;
    const insetNum =
      Number(inset) >= 0.1 && Number(inset) <= 1 ? Number(inset) : 1;
    setLogoInsetScale(insetNum);
    setLogoLoadingPreset(true);
    setLogoInputMode("preset");
    try {
      const dataUrl = await svgModuleToDataUrl(moduleRef);
      setLogoUrl(dataUrl);
    } catch {
      setError("לא ניתן לטעון לוגו מוכן");
      setLogoUrl("");
    } finally {
      setLogoLoadingPreset(false);
    }
  }, []);

  const clearLogo = useCallback(() => {
    setLogoUrl("");
    setLogoInsetScale(1);
  }, []);

  return {
    url,
    setUrl,
    fgColor,
    setFgColor,
    bgColor,
    setBgColor,
    bgColorMode,
    setBgColorMode,
    bgEffect,
    setBgEffect,
    dotsType,
    setDotsType,
    cornersType,
    setCornersType,
    stickerType,
    setStickerType,
    logoShape,
    setLogoShape,
    logoInputMode,
    setLogoInputMode,
    logoUrl,
    setLogoUrl,
    setLogoInsetScale,
    logoLoadingPreset,
    selectPresetLogo,
    clearLogo,
    qrImage,
    loading,
    error,
    setError,
    refetchQr: generateQr,
  };
}
