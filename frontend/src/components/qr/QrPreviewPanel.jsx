import { useState, useEffect, useRef, useCallback } from "react";
import { FiFileText, FiSave, FiChevronDown } from "react-icons/fi";
import SimpleTextModal from "../SimpleTextModal";

/**
 * שלב 3: תצוגה מקדימה והורדות.
 */
function QrPreviewPanel({
  qrType,
  qrInputs,
  pdfInputMode,
  pdfFile,
  previewImage,
  qrImage,
  error,
  loading,
  bgColorMode,
  bgEffect,
  bgColor,
  stickerType,
  getEffectBackground,
  downloadQR,
  saveQr,
  saveQrSaving,
  saveQrMessage,
}) {
  const showPdfFileHint =
    qrType === "pdf" && pdfInputMode === "file" && pdfFile && !qrInputs.pdf;

  const hideQrImageArea = showPdfFileHint;

  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("png");
  const downloadSplitRef = useRef(null);

  const [saveNameModalOpen, setSaveNameModalOpen] = useState(false);
  const [saveNameBusy, setSaveNameBusy] = useState(false);

  const downloadFormatLabels = {
    png: "PNG",
    svg: "SVG",
    jpg: "JPG",
    pdf: "PDF",
  };

  useEffect(() => {
    if (!downloadMenuOpen) return;
    const close = (e) => {
      if (
        downloadSplitRef.current &&
        !downloadSplitRef.current.contains(e.target)
      ) {
        setDownloadMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [downloadMenuOpen]);

  const selectDownloadFormat = (format) => {
    setDownloadFormat(format);
    setDownloadMenuOpen(false);
  };

  const handleConfirmSaveName = useCallback(
    async (name) => {
      setSaveNameBusy(true);
      try {
        return await saveQr(name);
      } finally {
        setSaveNameBusy(false);
      }
    },
    [saveQr],
  );

  return (
    <div className="col-lg-5">
      <SimpleTextModal
        open={saveNameModalOpen}
        onClose={() => !saveNameBusy && setSaveNameModalOpen(false)}
        title="שמירה לאוסף"
        description="בחר שם שיעזור לך למצוא את הקוד בדף «הקודים שלי»."
        label="שם לקוד"
        placeholder="למשל: כרטיס ביקור, קמפיין אביב…"
        confirmLabel="שמור לאוסף"
        busy={saveNameBusy}
        defaultValue=""
        onConfirm={handleConfirmSaveName}
      />

      <div className="card qr-card shadow-sm h-100">
        <div className="card-body p-4 d-flex flex-column">
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="qr-step">3</span>
            <h5 className="mb-0">קוד ה-QR שלך</h5>
          </div>

          <div
            className={`qr-preview mb-4 flex-grow-1 ${
              bgColorMode === "none" ? "transparent-bg" : ""
            } ${stickerType !== "none" ? "qr-preview--with-sticker" : ""}`}
            style={
              bgColorMode === "effect" && bgEffect !== "none"
                ? { background: getEffectBackground(bgEffect) }
                : bgColorMode === "none"
                  ? {}
                  : { background: bgColor }
            }
          >
            {loading && (
              <div className="text-center">
                <div className="spinner-border text-teal mb-3" role="status" />
                <div className="text-muted">יוצר QR...</div>
              </div>
            )}
            {!loading && error && (
              <div
                className="text-center text-danger px-3"
                role="alert"
              >
                {error}
              </div>
            )}
            {!loading && !error && showPdfFileHint && (
              <div className="text-center" style={{ color: "#0a9396" }}>
                <FiFileText size={64} className="mb-3" />
                <h5 className="mb-3">קובץ נבחר בהצלחה!</h5>
                <div className="text-muted mb-2">
                  <p className="mb-2">
                    העלה את הקובץ לשירות אחסון (Google Drive, Dropbox וכו')
                  </p>
                  <p className="mb-2"> לחץ על &quot;הדבקת URL&quot; למעלה</p>
                  <p className="mb-0">הדבק את הקישור ליצירת QR code</p>
                </div>
              </div>
            )}
            {!loading && !error && !hideQrImageArea && qrImage && (
              <img
                src={previewImage}
                alt="קוד QR שנוצר"
                className={`img-fluid qr-image ${stickerType !== "none" ? "qr-image--sticker" : ""}`}
              />
            )}
            {!loading && !error && !hideQrImageArea && !qrImage && (
              <div className="text-center text-muted">
                <div className="display-6">QR</div>
                התחל להקליד כדי ליצור קוד QR.
              </div>
            )}
          </div>

          <div className="row g-2 align-items-stretch">
            <div className="col-12 col-md-8">
              <div
                className="qr-download-split-wrap position-relative"
                ref={downloadSplitRef}
              >
                <div className="qr-download-split">
                  <button
                    type="button"
                    className="qr-download-split-main btn btn-teal"
                    onClick={() => downloadQR(downloadFormat)}
                    disabled={!qrImage || loading}
                    aria-label={`הורד כקובץ ${downloadFormatLabels[downloadFormat]}`}
                  >
                    הורד {downloadFormatLabels[downloadFormat]}
                  </button>
                  <button
                    type="button"
                    className="qr-download-split-toggle btn btn-teal"
                    onClick={() => setDownloadMenuOpen((o) => !o)}
                    disabled={!qrImage || loading}
                    aria-expanded={downloadMenuOpen}
                    aria-haspopup="menu"
                    aria-label="עוד פורמטים להורדה"
                  >
                    <FiChevronDown
                      size={20}
                      style={{
                        transform: downloadMenuOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease",
                      }}
                      aria-hidden
                    />
                  </button>
                </div>
                {downloadMenuOpen && (
                  <div
                    className="qr-download-split-menu"
                    role="menu"
                    aria-label="בחירת פורמט להורדה"
                  >
                    <button
                      type="button"
                      className="qr-download-split-option"
                      role="menuitem"
                      onClick={() => selectDownloadFormat("png")}
                    >
                      PNG
                    </button>
                    <button
                      type="button"
                      className="qr-download-split-option"
                      role="menuitem"
                      onClick={() => selectDownloadFormat("svg")}
                    >
                      SVG
                    </button>
                    <button
                      type="button"
                      className="qr-download-split-option"
                      role="menuitem"
                      onClick={() => selectDownloadFormat("jpg")}
                    >
                      JPG
                    </button>
                    <button
                      type="button"
                      className="qr-download-split-option"
                      role="menuitem"
                      onClick={() => selectDownloadFormat("pdf")}
                    >
                      PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 col-md-4">
              <button
                type="button"
                className="btn btn-outline-teal w-100 h-100 d-inline-flex align-items-center justify-content-center gap-2 px-2 text-wrap"
                onClick={() => setSaveNameModalOpen(true)}
                disabled={!qrImage || loading || saveQrSaving}
                title="שמירה לאוסף"
              >
                <FiSave size={18} aria-hidden />
                {saveQrSaving ? "שומר..." : "שמירה לאוסף"}
              </button>
            </div>
          </div>
          {saveQrMessage && (
            <p
              className={`small mt-3 mb-0 text-center ${
                saveQrMessage.includes("נכשל") ? "text-danger" : "text-success"
              }`}
              role="status"
            >
              {saveQrMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QrPreviewPanel;
