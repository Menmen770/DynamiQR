import { useEffect, useId, useState } from "react";

/**
 * כפתור ? ליד בורר סטטי/דינמי — פותח מודאל עם הסבר קצר.
 */
export default function QrStaticDynamicHelpButton() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const dialogId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="qr-static-dynamic-help-btn"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? dialogId : undefined}
        title="מה ההבדל בין סטטי לדינמי?"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 320 512" aria-hidden className="qr-static-dynamic-help-icon">
          <path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
        </svg>
        <span className="visually-hidden">מה ההבדל בין סטטי לדינמי</span>
      </button>

      {open ? (
        <div
          id={dialogId}
          className="modal fade show d-block simple-text-modal-backdrop qr-static-dynamic-help-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          dir="rtl"
          onClick={() => setOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h2 className="modal-title h5 fw-bold" id={titleId}>
                  סטטי ודינמי — מה ההבדל?
                </h2>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="סגור"
                  onClick={() => setOpen(false)}
                />
              </div>
              <div className="modal-body pt-2 small">
                <p className="mb-3">
                  <strong className="text-body">QR סטטי:</strong> הקישור או התוכן נשמרים{" "}
                  <strong>ישירות בתוך</strong> קוד ה‑QR. כל סריקה פותחת את אותה כתובת.
                  כדי לשנות יעד צריך{" "}
                  <strong>לייצר QR חדש</strong> ולהחליף הדפסות או תצוגה.
                </p>
                <p className="mb-3">
                  <strong className="text-body">QR דינמי:</strong> ב‑QR נשמר קישור קצר{" "}
                  <strong>קבוע</strong> דרך השרת שלנו; הסורק מועבר ליעד הנוכחי שאפשר{" "}
                  <strong>לעדכן מהחשבון</strong> בלי להדפיס מחדש, כולל אפשרות{" "}
                  <strong>לסטטיסטיקות סריקות</strong>.
                </p>
                <p className="mb-0 text-muted">
                  תוכן שלא אמור להשתנה — סטטי. קמפיינים, קישורים משתנים או צורך במעקב —
                  דינמי.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-teal btn-sm"
                  onClick={() => setOpen(false)}
                >
                  הבנתי
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
