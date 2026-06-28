import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  shareQrImageFromFileUri,
  shareQrImageFromDataUrl,
} from "../utils/savedQrHelpersMobile";
import { captureQrPreviewToFile } from "../utils/qrExportCaptureMobile";
import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  getDynamicQrRedirectBase,
  parseJsonResponse,
} from "../utils/api";
import { svgModuleToDataUrl } from "../utils/svgDataUrlFromModule";
import { validateLogoPayloadSize } from "../utils/prepareLogoImageMobile";
import {
  DEFAULT_BG_GRADIENT,
  DEFAULT_QR_GRADIENT,
  getGradientPrimaryColor,
} from "../utils/qrGradientsMobile";
import {
  buildEncodedQrText,
  createEmptyQrInputs,
} from "../utils/qrEncodedTextMobile";

const RECENT_QR_KEY = "dynamiqrRecentHistory";
const LEGACY_RECENT_QR_KEYS = ["qrMasterRecentHistory", "qrCreatorRecentQrHistory"];
const DEBOUNCE_MS = 450;

function setNestedInput(prev, path, value) {
  const keys = path.split(".");
  if (keys.length === 1) {
    return { ...prev, [keys[0]]: value };
  }
  const [head, ...rest] = keys;
  const nested = prev[head] && typeof prev[head] === "object" ? prev[head] : {};
  return {
    ...prev,
    [head]: setNestedInput(nested, rest.join("."), value),
  };
}

export function useQrGeneratorMobile(initialPayload, previewCaptureRef) {
  const [qrType, setQrType] = useState("url");
  const [qrInputs, setQrInputs] = useState(createEmptyQrInputs);
  const [fgColor, setFgColor] = useState("#000000");
  const [qrColorMode, setQrColorMode] = useState("solid");
  const [dotsGradient, setDotsGradient] = useState(DEFAULT_QR_GRADIENT);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgColorMode, setBgColorMode] = useState("solid");
  const [bgGradient, setBgGradient] = useState(DEFAULT_BG_GRADIENT);
  const [dotsType, setDotsType] = useState("square");
  const [cornersType, setCornersType] = useState("square");
  const [stickerType, setStickerType] = useState("none");
  const [logoShape, setLogoShape] = useState("overlay");
  const [logoInputMode, setLogoInputMode] = useState("preset");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoInsetScale, setLogoInsetScale] = useState(1);
  const [logoLoadingPreset, setLogoLoadingPreset] = useState(false);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState("Q");

  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveQrSaving, setSaveQrSaving] = useState(false);
  const [saveQrMessage, setSaveQrMessage] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [linkMode, setLinkMode] = useState("static");
  const [publicSlug, setPublicSlug] = useState(null);

  const requestIdRef = useRef(0);
  const appliedInitialRef = useRef(false);

  const encodedText = useMemo(
    () => buildEncodedQrText(qrType, qrInputs),
    [qrType, qrInputs],
  );

  const qrTextForEncode = useMemo(() => {
    if (linkMode === "dynamic" && publicSlug) {
      const base = getDynamicQrRedirectBase().replace(/\/$/, "");
      const slug = String(publicSlug).trim().toLowerCase();
      return `${base}/api/r/${slug}`;
    }
    const raw = String(encodedText || "").trim();
    if (linkMode === "dynamic" && !publicSlug && raw) {
      try {
        const u = new URL(raw);
        if (!u.hash || u.hash === "#") {
          u.hash = "qrd";
          return u.toString();
        }
      } catch {
        /* לא URL מלא */
      }
    }
    return raw;
  }, [linkMode, publicSlug, encodedText]);

  const handleInputChange = useCallback((path, value) => {
    setQrInputs((prev) => setNestedInput(prev, path, value));
    setError("");
  }, []);

  const handleQRTypeChange = useCallback((type) => {
    setLinkMode("static");
    setPublicSlug(null);
    setQrType(type);
    setError("");
  }, []);

  const handleLinkModeChange = useCallback((mode) => {
    const m = mode === "dynamic" ? "dynamic" : "static";
    setLinkMode(m);
    if (m === "static") {
      setPublicSlug(null);
    }
  }, []);

  useEffect(() => {
    if (!initialPayload || appliedInitialRef.current) return;
    appliedInitialRef.current = true;
    if (initialPayload.qrType) setQrType(initialPayload.qrType);
    if (initialPayload.linkMode === "dynamic") {
      setLinkMode("dynamic");
      setPublicSlug(initialPayload.publicSlug || null);
    } else if (initialPayload.linkMode === "static") {
      setLinkMode("static");
      setPublicSlug(null);
    }
    if (initialPayload.qrInputs) {
      setQrInputs((prev) => {
        const merged = {
          ...prev,
          ...initialPayload.qrInputs,
          whatsapp: { ...prev.whatsapp, ...initialPayload.qrInputs.whatsapp },
          email: { ...prev.email, ...initialPayload.qrInputs.email },
          sms: { ...prev.sms, ...initialPayload.qrInputs.sms },
          wifi: { ...prev.wifi, ...initialPayload.qrInputs.wifi },
          contact: { ...prev.contact, ...initialPayload.qrInputs.contact },
        };
        if (
          initialPayload.linkMode === "dynamic" &&
          String(initialPayload.dynamicTargetUrl || "").trim()
        ) {
          const target = String(initialPayload.dynamicTargetUrl).trim();
          if (initialPayload.qrType === "pdf") {
            return { ...merged, pdf: target };
          }
          return { ...merged, url: target };
        }
        return merged;
      });
    } else if (initialPayload.url) {
      setQrInputs((prev) => ({ ...prev, url: initialPayload.url }));
    }
    const s = initialPayload.style;
    if (s && typeof s === "object") {
      if (s.fgColor) setFgColor(s.fgColor);
      if (s.qrColorMode) setQrColorMode(s.qrColorMode);
      if (s.dotsGradient) setDotsGradient(s.dotsGradient);
      if (s.bgColor) setBgColor(s.bgColor);
      if (s.bgColorMode) setBgColorMode(s.bgColorMode);
      if (s.bgGradient) setBgGradient(s.bgGradient);
      if (s.dotsType) setDotsType(s.dotsType);
      if (s.cornersType) setCornersType(s.cornersType);
      if (s.stickerType) setStickerType(s.stickerType);
      if (s.logoShape) setLogoShape(s.logoShape);
      if (typeof s.logoUrl === "string" && s.logoUrl) {
        setLogoUrl(s.logoUrl);
        setLogoInputMode("upload");
      }
      if (Number(s.logoInsetScale) > 0)
        setLogoInsetScale(Number(s.logoInsetScale));
      if (s.errorCorrectionLevel)
        setErrorCorrectionLevel(s.errorCorrectionLevel);
      if (s.logoInputMode) setLogoInputMode(s.logoInputMode);
    }
  }, [initialPayload]);

  useEffect(() => {
    if (!saveQrMessage) return;
    const t = setTimeout(() => setSaveQrMessage(null), 4000);
    return () => clearTimeout(t);
  }, [saveQrMessage]);

  const generateQr = useCallback(async () => {
    const text = String(qrTextForEncode || "").trim();
    if (!text) {
      setQrImage(null);
      setError("");
      return;
    }

    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError("");

    const bgForAPI =
      stickerType !== "none" ||
      bgColorMode === "none" ||
      bgColorMode === "gradient"
        ? "transparent"
        : bgColor;

    const body = {
      text,
      color:
        qrColorMode === "gradient"
          ? getGradientPrimaryColor(dotsGradient, fgColor)
          : fgColor,
      bgColor: bgForAPI,
      dotsType,
      cornersType,
      logoShape,
      errorCorrectionLevel,
    };

    if (qrColorMode === "gradient") {
      body.dotsGradient = dotsGradient;
    }

    if (logoUrl) {
      const sizeErr = validateLogoPayloadSize(logoUrl);
      if (sizeErr) {
        setError(sizeErr);
        setQrImage(null);
        setLoading(false);
        return;
      }
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
          type: qrType,
          value: text,
          createdAt: new Date().toISOString(),
        };
        let raw = await AsyncStorage.getItem(RECENT_QR_KEY);
        if (!raw) {
          for (const legacyKey of LEGACY_RECENT_QR_KEYS) {
            raw = await AsyncStorage.getItem(legacyKey);
            if (raw) break;
          }
        }
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
    qrTextForEncode,
    qrType,
    fgColor,
    qrColorMode,
    dotsGradient,
    bgColor,
    bgColorMode,
    bgGradient,
    dotsType,
    cornersType,
    stickerType,
    logoShape,
    logoUrl,
    logoInsetScale,
    errorCorrectionLevel,
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

  const buildSavePayload = useCallback(
    (displayName) => ({
      displayName: String(displayName || "QR חדש").trim(),
      qrType,
      qrInputs,
      qrValue: encodedText,
      linkMode: linkMode === "dynamic" ? "dynamic" : "static",
      style: {
        fgColor,
        qrColorMode,
        dotsGradient,
        bgColor,
        bgColorMode,
        bgGradient,
        dotsType,
        cornersType,
        stickerType,
        logoShape,
        logoUrl: logoUrl || null,
        logoInsetScale,
        errorCorrectionLevel,
        logoInputMode,
      },
    }),
    [
      qrType,
      qrInputs,
      encodedText,
      linkMode,
      fgColor,
      qrColorMode,
      dotsGradient,
      bgColor,
      bgColorMode,
      bgGradient,
      dotsType,
      cornersType,
      stickerType,
      logoShape,
      logoUrl,
      logoInsetScale,
      errorCorrectionLevel,
    ],
  );

  const saveQr = useCallback(
    async (displayName) => {
      if (!qrImage) {
        setSaveQrMessage("צור QR לפני שמירה");
        return false;
      }
      if (linkMode === "dynamic" && !publicSlug) {
        const built = String(encodedText || "").trim();
        if (!built) {
          setSaveQrMessage("נא למלא את פרטי הקוד לפני שמירה במצב דינמי");
          return false;
        }
        if (qrType === "url") {
          const u = String(qrInputs?.url || "").trim();
          if (!/^https?:\/\//i.test(u)) {
            setSaveQrMessage("לקישור דינמי נדרש כתובת http או https תקינה");
            return false;
          }
        }
      }
      const name = String(displayName || "").trim();
      if (!name) {
        setSaveQrMessage("נא להזין שם");
        return false;
      }

      setSaveQrSaving(true);
      setSaveQrMessage(null);
      try {
        const response = await apiFetchWithTimeout(
          `${getApiBaseUrl()}/api/saved-qrs`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildSavePayload(name)),
          },
          30000,
        );
        const data = await parseJsonResponse(response);
        if (!response.ok) {
          throw new Error(data?.error || "שמירה נכשלה");
        }
        const saved = data?.saved;
        if (saved?.linkMode === "dynamic" && saved?.publicSlug) {
          setLinkMode("dynamic");
          setPublicSlug(saved.publicSlug);
        }
        setSaveQrMessage(
          data?.updated ? "עודכן באוסף" : "נשמר בהצלחה לאוסף שלך",
        );
        return true;
      } catch (e) {
        setSaveQrMessage(e.message || "שמירה נכשלה");
        return false;
      } finally {
        setSaveQrSaving(false);
      }
    },
    [qrImage, buildSavePayload, linkMode, publicSlug, encodedText, qrType, qrInputs],
  );

  const exportQr = useCallback(async () => {
    if (!qrImage) {
      Alert.alert("אין QR", "הזן תוכן תקין כדי ליצור קוד QR");
      return;
    }

    setExporting(true);
    try {
      let fileUri;
      try {
        fileUri = await captureQrPreviewToFile(previewCaptureRef, {
          stickerType,
          bgColorMode,
        });
      } catch {
        fileUri = null;
      }
      if (fileUri) {
        await shareQrImageFromFileUri(fileUri, "שתף או שמור את קוד ה-QR");
      } else {
        await shareQrImageFromDataUrl(qrImage, "שתף או שמור את קוד ה-QR");
      }
    } catch (e) {
      Alert.alert("שגיאה", e.message || "לא ניתן לייצא את הקוד");
    } finally {
      setExporting(false);
    }
  }, [qrImage, previewCaptureRef, stickerType, bgColorMode]);

  return {
    qrType,
    setQrType: handleQRTypeChange,
    qrInputs,
    handleInputChange,
    fgColor,
    setFgColor,
    qrColorMode,
    setQrColorMode,
    dotsGradient,
    setDotsGradient,
    bgColor,
    setBgColor,
    bgColorMode,
    setBgColorMode,
    bgGradient,
    setBgGradient,
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
    errorCorrectionLevel,
    setErrorCorrectionLevel,
    qrImage,
    loading,
    error,
    setError,
    encodedText,
    qrTextForEncode,
    linkMode,
    handleLinkModeChange,
    refetchQr: generateQr,
    saveQr,
    saveQrSaving,
    saveQrMessage,
    exportQr,
    exporting,
  };
}
