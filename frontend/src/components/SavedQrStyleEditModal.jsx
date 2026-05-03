import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../config";
import {
  BG_EFFECTS,
  PRESET_BG_COLORS,
  PRESET_QR_COLORS,
  STICKER_OPTIONS,
  getEffectBackground,
} from "../utils/qrConstants";
import { getSavedQrPreviewDataUrl } from "../utils/savedQrPreview";
import { QrStylePanel } from "./qr";

function buildDraftFromRow(row) {
  const st = row.style && typeof row.style === "object" ? { ...row.style } : {};
  return {
    qrType: row.qrType || "url",
    qrValue: String(row.qrValue ?? "").trim(),
    qrInputs:
      row.qrInputs && typeof row.qrInputs === "object"
        ? JSON.parse(JSON.stringify(row.qrInputs))
        : {},
    style: {
      fgColor: st.fgColor ?? "#000000",
      bgColor: st.bgColor ?? "#ffffff",
      bgColorMode: st.bgColorMode ?? "solid",
      bgEffect: st.bgEffect ?? "none",
      dotsType: st.dotsType ?? "square",
      cornersType: st.cornersType ?? "square",
      logoUrl: typeof st.logoUrl === "string" ? st.logoUrl : "",
      logoShape: st.logoShape ?? "square",
      stickerType: st.stickerType ?? "none",
      pdfInputMode: st.pdfInputMode ?? "file",
      logoInputMode: st.logoInputMode ?? "preset",
    },
  };
}

function rowFromDraft(row, draft) {
  return {
    ...row,
    qrType: draft.qrType,
    qrValue: draft.qrValue,
    qrInputs: draft.qrInputs,
    style: draft.style,
  };
}

/**
 * מודל עריכת עיצוב לשמור — נשאר בדף «הקודים שלי» ושומר ב־PATCH.
 */
export default function SavedQrStyleEditModal({
  open,
  onClose,
  row,
  onSaved,
  onError,
}) {
  const [draft, setDraft] = useState(() => buildDraftFromRow(row));
  const [activeTab, setActiveTab] = useState("color");
  const [logoFile, setLogoFile] = useState(null);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && row) {
      setDraft(buildDraftFromRow(row));
      setActiveTab("color");
      setLogoFile(null);
      setIsLogoDragging(false);
      setPreviewUrl("");
    }
  }, [open, row]);

  useEffect(() => {
    if (!open || !row) return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const url = await getSavedQrPreviewDataUrl(
          rowFromDraft(row, draft),
          API_BASE,
        );
        if (!cancelled) setPreviewUrl(url || "");
      } catch {
        if (!cancelled) setPreviewUrl("");
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 420);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [open, row, draft]);

  const patchStyle = useCallback((patch) => {
    setDraft((d) => ({ ...d, style: { ...d.style, ...patch } }));
  }, []);

  const setFgColor = (v) => patchStyle({ fgColor: v });
  const setBgColor = (v) => patchStyle({ bgColor: v });
  const setBgColorMode = (v) => patchStyle({ bgColorMode: v });
  const setBgEffect = (v) => patchStyle({ bgEffect: v });
  const setDotsType = (v) => patchStyle({ dotsType: v });
  const setCornersType = (v) => patchStyle({ cornersType: v });
  const setStickerType = (v) => patchStyle({ stickerType: v });
  const setLogoInputMode = (v) => patchStyle({ logoInputMode: v });
  const setLogoShape = (v) => patchStyle({ logoShape: v });
  const setLogoUrl = (v) => patchStyle({ logoUrl: v });

  const handleLogoDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsLogoDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        patchStyle({ logoInputMode: "file" });
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          patchStyle({ logoUrl: ev.target?.result || "" });
        };
        reader.readAsDataURL(file);
      }
    },
    [patchStyle],
  );

  const handleLogoDragOver = useCallback((e) => {
    e.preventDefault();
    setIsLogoDragging(true);
  }, []);

  const handleLogoDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsLogoDragging(false);
  }, []);

  const handleLogoFileSelect = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        patchStyle({ logoInputMode: "file" });
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          patchStyle({ logoUrl: ev.target?.result || "" });
        };
        reader.readAsDataURL(file);
      }
    },
    [patchStyle],
  );

  const handleSave = async () => {
    if (!row?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/saved-qrs/${row._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: draft.style,
          qrInputs: draft.qrInputs,
          qrValue: draft.qrValue,
          qrType: draft.qrType,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "שמירה נכשלה");
      }
      if (data?.saved) {
        onSaved(data.saved);
        window.dispatchEvent(new Event("qr-saved-updated"));
        onClose();
      } else {
        throw new Error("תשובת שרת לא תקינה");
      }
    } catch (err) {
      onError(err.message || "שמירה נכשלה");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const s = draft.style;

  return (
    <div
      className="modal fade show d-block saved-qr-style-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-qr-style-modal-title"
      dir="rtl"
      onClick={saving ? undefined : onClose}
    >
      <div
        className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
          <div className="modal-header border-0 dashboard-float-modal-header">
            <h2 className="modal-title h5 fw-bold mb-0 flex-grow-1 min-w-0" id="saved-qr-style-modal-title">
              עריכת עיצוב
            </h2>
            <button
              type="button"
              className="btn-close"
              aria-label="סגירה"
              onClick={onClose}
              disabled={saving}
            />
          </div>
          <div className="modal-body pt-0">
            <p className="text-muted small mb-3">
              שינויים נשמרים על אותו קוד שמור. לשינוי היעד או הסוג השתמשו במחולל
              (פתח).
            </p>
            <div className="row g-4 align-items-start">
              <div className="col-lg-4">
                <div className="card border-0 bg-light">
                  <div className="card-body text-center">
                    <div className="small text-muted mb-2">תצוגה מקדימה</div>
                    <div className="saved-qr-style-preview-box rounded-3 bg-white mx-auto d-flex align-items-center justify-content-center overflow-hidden">
                      {previewLoading ? (
                        <span
                          className="spinner-border spinner-border-sm text-secondary"
                          role="status"
                        />
                      ) : previewUrl ? (
                        <img
                          src={previewUrl}
                          alt=""
                          className="img-fluid saved-qr-style-preview-img"
                        />
                      ) : (
                        <span className="small text-muted px-2">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <QrStylePanel
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  fgColor={s.fgColor}
                  setFgColor={setFgColor}
                  bgColor={s.bgColor}
                  setBgColor={setBgColor}
                  bgColorMode={s.bgColorMode}
                  setBgColorMode={setBgColorMode}
                  bgEffect={s.bgEffect}
                  setBgEffect={setBgEffect}
                  qrPresetColors={PRESET_QR_COLORS}
                  bgPresetColors={PRESET_BG_COLORS}
                  bgEffects={BG_EFFECTS}
                  getEffectBackground={getEffectBackground}
                  dotsType={s.dotsType}
                  setDotsType={setDotsType}
                  cornersType={s.cornersType}
                  setCornersType={setCornersType}
                  stickerOptions={STICKER_OPTIONS}
                  stickerType={s.stickerType}
                  setStickerType={setStickerType}
                  logoInputMode={s.logoInputMode}
                  setLogoInputMode={setLogoInputMode}
                  logoShape={s.logoShape}
                  setLogoShape={setLogoShape}
                  logoUrl={s.logoUrl}
                  setLogoUrl={setLogoUrl}
                  logoFile={logoFile}
                  setLogoFile={setLogoFile}
                  isLogoDragging={isLogoDragging}
                  handleLogoDrop={handleLogoDrop}
                  handleLogoDragOver={handleLogoDragOver}
                  handleLogoDragLeave={handleLogoDragLeave}
                  handleLogoFileSelect={handleLogoFileSelect}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={saving}
            >
              ביטול
            </button>
            <button
              type="button"
              className="btn btn-teal"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? "שומר…" : "שמור עיצוב"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
