import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../config";

export default function DynamicQrManageModal({
  open,
  onClose,
  row,
  onSaved,
  onError,
}) {
  const [targetUrl, setTargetUrl] = useState("");
  const [paused, setPaused] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !row) return;
    setTargetUrl(String(row.dynamicTargetUrl || "").trim());
    setPaused(row.redirectPaused === true);
  }, [open, row]);

  const handleSave = useCallback(async () => {
    if (!row?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/saved-qrs/${row._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dynamicTargetUrl: targetUrl.trim(),
          redirectPaused: paused,
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
      }
    } catch (e) {
      onError(e.message || "שמירה נכשלה");
    } finally {
      setSaving(false);
    }
  }, [row?._id, targetUrl, paused, onSaved, onClose, onError]);

  if (!open) return null;

  return (
    <div
      className="modal fade show d-block saved-qr-style-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dynamic-qr-modal-title"
      dir="rtl"
      onClick={saving ? undefined : onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0">
            <h2 className="modal-title h5 fw-bold" id="dynamic-qr-modal-title">
              יעד הפניה
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
              כתובת היעד אחרי הסריקה. הקישור הקצר ב־QR נשאר קבוע — בכרטיס מוצג מתחת לתאריך.
            </p>
            <div className="mb-3">
              <label className="form-label" htmlFor="dynamic-target-url">
                יעד הפניה (https)
              </label>
              <input
                id="dynamic-target-url"
                type="url"
                className="form-control"
                dir="ltr"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="form-check mb-0">
              <input
                id="dynamic-paused"
                type="checkbox"
                className="form-check-input"
                checked={paused}
                onChange={(e) => setPaused(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="dynamic-paused">
                השהיית הפניה (מי שסורק יראה הודעה במקום מעבר לאתר)
              </label>
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
              {saving ? "שומר…" : "שמור"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
