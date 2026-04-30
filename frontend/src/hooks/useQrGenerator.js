import { useEffect, useState, useCallback, useMemo } from "react";
import { API_BASE, getDynamicQrRedirectBase } from "../config";
import {
  getStickerOverlayUrl,
  isImageStickerId,
  STICKER_QR_NORMALIZED_RECT,
} from "../assets/stickerAssets";
import { drawStickerImageComposite } from "../utils/stickerCompose";
import { paintExportBackground } from "../utils/qrExportBackground";
import { getEffectBackground } from "../utils/qrConstants";
import {
  getPresetRasterInsetForDataUrl,
  isPresetLogoDataUrl,
} from "../utils/presetBrandLogos";
import {
  isSvgDataUrl,
  rasterizeSvgDataUrlToPng,
} from "../utils/rasterizeSvgLogo";
import { loadRecentQrItems, saveRecentQrItems } from "../utils/recentQrStorage";
import { buildEncodedQrText } from "../utils/qrEncodedText";

function downloadBlobAsFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function mergeQrInputs(base, patch) {
  if (!patch || typeof patch !== "object") return base;
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const v = patch[key];
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      out[key] = { ...base[key], ...v };
    } else if (v !== undefined) {
      out[key] = v;
    }
  }
  return out;
}

export function useQrGenerator() {
  const [qrType, setQrType] = useState("url");
  const [qrValue, setQrValue] = useState("https://example.com");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bgColorMode, setBgColorMode] = useState("solid");
  const [bgEffect, setBgEffect] = useState("none");
  const [pdfFile, setPdfFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfInputMode, setPdfInputMode] = useState("file");
  const [dotsType, setDotsType] = useState("square");
  const [cornersType, setCornersType] = useState("square");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState("preset");
  const [logoShape, setLogoShape] = useState("overlay");
  const [stickerType, setStickerType] = useState("none");
  const [previewWithSticker, setPreviewWithSticker] = useState("");
  const [saveQrSaving, setSaveQrSaving] = useState(false);
  const [saveQrMessage, setSaveQrMessage] = useState(null);
  const [linkMode, setLinkMode] = useState("static");
  const [publicSlug, setPublicSlug] = useState(null);

  const [qrInputs, setQrInputs] = useState({
    url: "https://example.com",
    pdf: "",
    whatsapp: { phone: "+972", message: "" },
    email: { email: "", subject: "", message: "" },
    phone: "+972",
    sms: { phone: "+972", message: "" },
    wifi: { ssid: "Network", password: "", security: "WPA" },
    contact: { name: "", phone: "+972", email: "" },
    facebook: "username",
    instagram: "username",
    twitter: "username",
    linkedin: "username",
    youtube: "username",
    tiktok: "username",
  });

  const handleQRTypeChange = (newType) => {
    setLinkMode("static");
    setPublicSlug(null);
    setQrType(newType);
    setQrValue(buildEncodedQrText(newType, qrInputs));
  };

  const handleInputChange = (path, value) => {
    const newInputs = JSON.parse(JSON.stringify(qrInputs));
    const keys = path.split(".");
    let obj = newInputs;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setQrInputs(newInputs);
    setQrValue(buildEncodedQrText(qrType, newInputs));
  };

  const handlePdfDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
  };

  const handlePdfDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePdfDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handlePdfFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
  };

  const handleLogoDrop = (e) => {
    e.preventDefault();
    setIsLogoDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setLogoInputMode("file");
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDragOver = (e) => {
    e.preventDefault();
    setIsLogoDragging(true);
  };

  const handleLogoDragLeave = (e) => {
    e.preventDefault();
    setIsLogoDragging(false);
  };

  const handleLogoFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setLogoInputMode("file");
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateQR = async (text, fg, bg) => {
    if (!text.trim()) {
      setQrImage("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      /* With sticker, QR must be transparent so step-3 background shows through the hole */
      const bgForAPI =
        stickerType !== "none"
          ? "transparent"
          : bgColorMode === "effect" || bgColorMode === "none"
            ? "transparent"
            : bg;

      const requestBody = {
        text,
        color: fg,
        bgColor: bgForAPI,
        dotsType,
        cornersType,
        logoShape,
      };

      if (logoUrl) {
        let imageForApi = logoUrl;
        if (isSvgDataUrl(logoUrl)) {
          try {
            const inset = getPresetRasterInsetForDataUrl(logoUrl);
            imageForApi = await rasterizeSvgDataUrlToPng(logoUrl, {
              insetScale: inset,
            });
          } catch {
            setError("לא ניתן לעבד את לוגו ה-SVG. נסה PNG או JPG.");
            setQrImage("");
            return;
          }
        }
        requestBody.image = imageForApi;
      }

      const response = await fetch(`${API_BASE}/api/generate-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setQrImage(data.qrImage);
    } catch {
      setError("נכשל ביצירת קוד QR");
      setQrImage("");
    } finally {
      setLoading(false);
    }
  };

  const qrTextForEncode = useMemo(() => {
    if (linkMode === "dynamic" && publicSlug) {
      const base = getDynamicQrRedirectBase().replace(/\/$/, "");
      const slug = String(publicSlug).trim().toLowerCase();
      return `${base}/api/r/${slug}`;
    }
    const raw = String(qrValue || "").trim();
    /* לפני שמירה אין slug — מוסיפים hash זמני כדי שה-QR ייראה שונה מסטטי; רוב האתרים מתעלמים מ-hash */
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
  }, [linkMode, publicSlug, qrValue]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (qrType === "pdf" && pdfInputMode === "file" && !qrInputs.pdf) {
        setQrImage("");
        return;
      }
      generateQR(qrTextForEncode, fgColor, bgColor);
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    qrTextForEncode,
    fgColor,
    bgColor,
    bgColorMode,
    bgEffect,
    qrType,
    pdfInputMode,
    qrInputs.pdf,
    dotsType,
    cornersType,
    logoUrl,
    logoShape,
    stickerType,
  ]);

  useEffect(() => {
    if (!qrImage || stickerType === "none") {
      setPreviewWithSticker("");
      return;
    }
    const overlayUrl = getStickerOverlayUrl(stickerType);
    if (!overlayUrl) {
      setPreviewWithSticker("");
      return;
    }
    const qrImg = new Image();
    const overlayImg = new Image();
    let qrOk = false;
    let ovOk = false;
    const tryComposite = () => {
      if (!qrOk || !ovOk) return;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: true });
      drawStickerImageComposite(
        ctx,
        qrImg,
        overlayImg,
        fgColor,
        STICKER_QR_NORMALIZED_RECT,
      );
      setPreviewWithSticker(canvas.toDataURL("image/png"));
    };
    qrImg.onload = () => {
      qrOk = true;
      tryComposite();
    };
    overlayImg.onload = () => {
      ovOk = true;
      tryComposite();
    };
    qrImg.onerror = () => setPreviewWithSticker("");
    overlayImg.onerror = () => setPreviewWithSticker("");
    qrImg.src = qrImage;
    overlayImg.src = overlayUrl;
  }, [qrImage, stickerType, fgColor]);

  useEffect(() => {
    if (!saveQrMessage) return;
    const t = setTimeout(() => setSaveQrMessage(null), 4000);
    return () => clearTimeout(t);
  }, [saveQrMessage]);

  const buildSavePayload = useCallback((extra = {}) => {
    const nameExtra =
      typeof extra.displayName === "string"
        ? extra.displayName.trim().slice(0, 120)
        : "";
    return {
      qrType,
      qrValue: String(qrValue || "").trim(),
      displayName: nameExtra,
      linkMode: linkMode === "dynamic" ? "dynamic" : "static",
      qrInputs,
      style: {
        fgColor,
        bgColor,
        bgColorMode,
        bgEffect,
        dotsType,
        cornersType,
        logoUrl:
          logoUrl && logoUrl.length > 400000 ? "" : logoUrl,
        logoShape,
        stickerType,
        pdfInputMode,
        logoInputMode,
      },
    };
  }, [
    qrType,
    qrValue,
    linkMode,
    qrInputs,
    fgColor,
    bgColor,
    bgColorMode,
    bgEffect,
    dotsType,
    cornersType,
    logoUrl,
    logoShape,
    stickerType,
    pdfInputMode,
    logoInputMode,
  ]);

  const applySavedQrPayload = useCallback((doc) => {
    if (!doc || typeof doc !== "object") return;
    setError("");
    setSaveQrMessage(null);
    const st = doc.style && typeof doc.style === "object" ? doc.style : {};
    setLinkMode(doc.linkMode === "dynamic" ? "dynamic" : "static");
    setPublicSlug(doc.publicSlug || null);
    setQrType(doc.qrType || "url");
    setQrInputs((prev) => {
      const merged = mergeQrInputs(prev, doc.qrInputs || {});
      if (doc.linkMode === "dynamic" && String(doc.dynamicTargetUrl || "").trim()) {
        return { ...merged, url: String(doc.dynamicTargetUrl).trim() };
      }
      return merged;
    });
    setQrValue(String(doc.qrValue ?? "").trim());
    setFgColor(st.fgColor ?? "#000000");
    setBgColor(st.bgColor ?? "#ffffff");
    setBgColorMode(st.bgColorMode ?? "solid");
    setBgEffect(st.bgEffect ?? "none");
    setDotsType(st.dotsType ?? "square");
    setCornersType(st.cornersType ?? "square");
    const loadedLogo =
      typeof st.logoUrl === "string" && st.logoUrl.length <= 450_000
        ? st.logoUrl
        : "";
    setLogoUrl(loadedLogo);
    setLogoShape(st.logoShape ?? "overlay");
    setStickerType(st.stickerType ?? "none");
    setPdfInputMode(st.pdfInputMode ?? "file");
    if (loadedLogo && isPresetLogoDataUrl(loadedLogo)) {
      setLogoInputMode("preset");
    } else {
      setLogoInputMode(st.logoInputMode ?? "preset");
    }
    setLogoFile(null);
    setPdfFile(null);
  }, []);

  const saveQr = useCallback(async (displayName) => {
    if (!qrImage) return false;
    if (linkMode === "dynamic" && !publicSlug) {
      const built = String(buildEncodedQrText(qrType, qrInputs) || "").trim();
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
    const nameTrim = String(displayName ?? "").trim();
    if (!nameTrim) {
      setSaveQrMessage("נא להזין שם לקוד");
      return false;
    }
    setSaveQrSaving(true);
    setSaveQrMessage(null);
    const payload = buildSavePayload({ displayName: nameTrim });
    try {
      const res = await fetch(`${API_BASE}/api/saved-qrs`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        /* empty body */
      }
      if (res.ok) {
        window.dispatchEvent(new Event("qr-saved-updated"));
        const saved = data?.saved;
        if (saved?.linkMode === "dynamic" && saved?.publicSlug) {
          setLinkMode("dynamic");
          setPublicSlug(saved.publicSlug);
          setQrValue("");
        }
        setSaveQrMessage(
          data.updated ? "עודכן באוסף" : "נשמר לאוסף",
        );
        return true;
      }
      if (res.status === 401) {
        try {
          const entry = {
            id: Date.now(),
            type: qrType,
            value: payload.qrValue,
            createdAt: new Date().toISOString(),
            fullPayload: {
              qrType: payload.qrType,
              qrValue: payload.qrValue,
              displayName: nameTrim,
              qrInputs: payload.qrInputs,
              style: payload.style,
            },
          };
          const existing = loadRecentQrItems();
          const next = [entry, ...existing].slice(0, 8);
          saveRecentQrItems(next);
          window.dispatchEvent(new Event("qr-recent-updated"));
        } catch {
          // ignore localStorage issues
        }
        setSaveQrMessage("נשמר מקומית בלבד (נדרשת התחברות לשמירה בענן)");
        return true;
      }
      setSaveQrMessage(data?.error || "השמירה נכשלה");
      return false;
    } catch {
      setSaveQrMessage("השמירה נכשלה");
      return false;
    } finally {
      setSaveQrSaving(false);
    }
  }, [
    qrImage,
    buildSavePayload,
    qrType,
    linkMode,
    publicSlug,
    qrInputs,
  ]);

  const handleLinkModeChange = useCallback((mode) => {
    const m = mode === "dynamic" ? "dynamic" : "static";
    setLinkMode(m);
    if (m === "static") {
      setPublicSlug(null);
      setQrValue(buildEncodedQrText(qrType, qrInputs));
    }
  }, [qrType, qrInputs]);

  const downloadQR = useCallback(
    (format) => {
      if (!qrImage) return;

      const fmt = format === "jpg" ? "jpeg" : format || "png";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: true });
      const img = new Image();

      img.onload = () => {
        const qrScale = 1.12;
        const extraPadding = Math.round(img.width * 0.12);
        const qrDrawWidth = Math.round(img.width * qrScale);
        const qrDrawHeight = Math.round(img.height * qrScale);

        const hasSticker =
          stickerType !== "none" && isImageStickerId(stickerType);
        const overlayUrl = hasSticker ? getStickerOverlayUrl(stickerType) : null;

        const exportBgState = {
          bgColorMode,
          bgColor,
          bgEffect,
          getEffectBackground,
        };

        const finalizeExport = () => {
          if (fmt === "png") {
            canvas.toBlob(
              (blob) => {
                if (blob) downloadBlobAsFile(blob, "qr-code.png");
              },
              "image/png",
            );
            return;
          }
          if (fmt === "jpeg") {
            canvas.toBlob(
              (blob) => {
                if (blob) downloadBlobAsFile(blob, "qr-code.jpg");
              },
              "image/jpeg",
              0.92,
            );
            return;
          }
          if (fmt === "svg") {
            const pngData = canvas.toDataURL("image/png");
            const w = canvas.width;
            const h = canvas.height;
            const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image width="${w}" height="${h}" xlink:href="${pngData}" href="${pngData}" />
</svg>`;
            const blob = new Blob([svg], {
              type: "image/svg+xml;charset=utf-8",
            });
            downloadBlobAsFile(blob, "qr-code.svg");
            return;
          }
          if (fmt === "pdf") {
            import("jspdf").then(({ jsPDF }) => {
              const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? "landscape" : "portrait",
                unit: "px",
                format: [canvas.width, canvas.height],
              });
              pdf.addImage(
                canvas.toDataURL("image/png"),
                "PNG",
                0,
                0,
                canvas.width,
                canvas.height,
              );
              pdf.save("qr-code.pdf");
            });
          }
        };

        if (hasSticker && overlayUrl) {
          const overlayImg = new Image();
          overlayImg.onload = () => {
            drawStickerImageComposite(
              ctx,
              img,
              overlayImg,
              fgColor,
              STICKER_QR_NORMALIZED_RECT,
              exportBgState,
            );
            finalizeExport();
          };
          overlayImg.onerror = finalizeExport;
          overlayImg.src = overlayUrl;
          return;
        }

        canvas.width = qrDrawWidth + extraPadding * 2;
        canvas.height = qrDrawHeight + extraPadding * 2;
        const drawX = extraPadding;
        const drawY = extraPadding;

        paintExportBackground(ctx, canvas.width, canvas.height, exportBgState);
        ctx.drawImage(img, drawX, drawY, qrDrawWidth, qrDrawHeight);

        finalizeExport();
      };

      img.src = qrImage;
    },
    [
      qrImage,
      stickerType,
      bgColorMode,
      bgColor,
      bgEffect,
      fgColor,
    ],
  );

  return {
    qrType,
    setQrType,
    qrValue,
    setQrValue,
    bgColor,
    setBgColor,
    fgColor,
    setFgColor,
    qrImage,
    previewImage: stickerType !== "none" && previewWithSticker ? previewWithSticker : qrImage,
    loading,
    error,
    bgColorMode,
    setBgColorMode,
    bgEffect,
    setBgEffect,
    pdfFile,
    setPdfFile,
    isDragging,
    pdfInputMode,
    setPdfInputMode,
    dotsType,
    setDotsType,
    cornersType,
    setCornersType,
    logoUrl,
    setLogoUrl,
    logoFile,
    setLogoFile,
    isLogoDragging,
    logoInputMode,
    setLogoInputMode,
    logoShape,
    setLogoShape,
    stickerType,
    setStickerType,
    qrInputs,
    handleQRTypeChange,
    handleInputChange,
    handlePdfDrop,
    handlePdfDragOver,
    handlePdfDragLeave,
    handlePdfFileSelect,
    handleLogoDrop,
    handleLogoDragOver,
    handleLogoDragLeave,
    handleLogoFileSelect,
    downloadQR,
    saveQr,
    saveQrSaving,
    saveQrMessage,
    applySavedQrPayload,
    linkMode,
    setLinkMode,
    publicSlug,
    setPublicSlug,
    handleLinkModeChange,
  };
}
