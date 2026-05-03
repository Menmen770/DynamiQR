import { useEffect, useState } from "react";

/**
 * מודל Bootstrap-סטייל לשורת טקסט אחת + אישור/ביטול.
 */
export default function SimpleTextModal({
  open,
  onClose,
  title,
  description,
  label,
  placeholder = "",
  confirmLabel,
  cancelLabel = "ביטול",
  maxLength = 120,
  minLength = 1,
  busy = false,
  defaultValue = "",
  onConfirm,
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue(defaultValue || "");
  }, [open, defaultValue]);

  if (!open) return null;

  const trimmed = value.trim();
  const canSubmit =
    !busy && (!minLength || trimmed.length >= minLength);

  const handleConfirm = async () => {
    if (!canSubmit) return;
    const result = await Promise.resolve(onConfirm(trimmed));
    if (result !== false) {
      setValue("");
      onClose();
    }
  };

  return (
    <div
      className="simple-text-modal-backdrop modal fade show d-block"
      role="dialog"
      aria-modal="true"
      aria-labelledby="simple-text-modal-title"
      dir="rtl"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow rounded-4 overflow-hidden dashboard-simple-text-modal-shell">
          <div className="modal-header border-0 pb-0 dashboard-float-modal-header">
            <h2 className="modal-title h5 fw-bold mb-0 flex-grow-1 min-w-0" id="simple-text-modal-title">
              {title}
            </h2>
            <button
              type="button"
              className="btn-close"
              aria-label={cancelLabel}
              onClick={onClose}
              disabled={busy}
            />
          </div>
          <div className="modal-body pt-2">
            {description ? (
              <p className="text-muted small mb-3">{description}</p>
            ) : null}
            <label className="form-label small fw-semibold mb-1" htmlFor="simple-text-modal-input">
              {label}
            </label>
            <input
              id="simple-text-modal-input"
              type="text"
              className="form-control"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={busy}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) void handleConfirm();
              }}
            />
          </div>
          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={busy}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className="btn btn-teal"
              onClick={() => void handleConfirm()}
              disabled={!canSubmit}
            >
              {busy ? "ממתין…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
