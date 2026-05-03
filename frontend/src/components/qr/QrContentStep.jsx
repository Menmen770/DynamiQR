import { FiFileText, FiX } from "react-icons/fi";
import QrLinkModeToggle from "./QrLinkModeToggle";
import QrPdfInputModeToggle from "./QrPdfInputModeToggle";

/**
 * שלב 1: כל שדות הקלט לפי סוג ה-QR.
 */
function QrContentStep({
  qrType,
  qrInputs,
  handleInputChange,
  pdfFile,
  setPdfFile,
  isDragging,
  pdfInputMode,
  setPdfInputMode,
  handlePdfDrop,
  handlePdfDragOver,
  handlePdfDragLeave,
  handlePdfFileSelect,
  linkMode,
  onLinkModeChange,
}) {
  return (
    <>
      {qrType === "url" && (
        <div className="qr-url-with-mode-row">
          <input
            type="url"
            value={qrInputs.url}
            onChange={(e) => handleInputChange("url", e.target.value)}
            placeholder="https://example.com"
            className="form-control form-control-lg qr-url-with-mode-input"
          />
          <QrLinkModeToggle
            linkMode={linkMode}
            onChange={onLinkModeChange}
          />
        </div>
      )}

      {qrType === "pdf" && (
        <div>
          <div className="qr-segmented-row mb-2">
            <QrPdfInputModeToggle
              pdfInputMode={pdfInputMode}
              onChange={setPdfInputMode}
            />
            {pdfInputMode === "file" ? (
              <QrLinkModeToggle
                linkMode={linkMode}
                onChange={onLinkModeChange}
              />
            ) : null}
          </div>

          {pdfInputMode === "file" ? (
            <>
              <div
                className={`pdf-drop-zone document-drop-zone qr-file-drop-zone-wide ${isDragging ? "dragging" : ""} ${pdfFile ? "has-file" : ""}`}
                onDrop={handlePdfDrop}
                onDragOver={handlePdfDragOver}
                onDragLeave={handlePdfDragLeave}
                onClick={() => document.getElementById("pdf-file-input").click()}
              >
                <input
                  id="pdf-file-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfFileSelect}
                  style={{ display: "none" }}
                />
                <div className="drop-zone-content document-upload-design">
                  {pdfFile ? (
                    <>
                      <button
                        type="button"
                        className="delete-file-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfFile(null);
                          handleInputChange("pdf", "");
                        }}
                        title="מחק קובץ"
                      >
                        <FiX size={18} />
                      </button>
                      <FiFileText size={36} className="mb-2" />
                      <h6 className="mb-1">{pdfFile.name}</h6>
                      <p className="text-muted mb-0 small">
                        {(pdfFile.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="document-upload-icon"
                        viewBox="0 0 640 512"
                        aria-hidden="true"
                      >
                        <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                      </svg>
                      <p className="mb-1 fw-semibold">גרור ושחרר</p>
                      <p className="mb-2 text-muted">או</p>
                      <span className="document-browse-button">בחר קובץ</span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="qr-url-with-mode-row">
                <input
                  type="url"
                  value={qrInputs.pdf}
                  onChange={(e) => handleInputChange("pdf", e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  className="form-control form-control-lg qr-url-with-mode-input"
                />
                <QrLinkModeToggle
                  linkMode={linkMode}
                  onChange={onLinkModeChange}
                />
              </div>
              <div className="form-text">הדבק כאן URL של קובץ PDF</div>
            </>
          )}
        </div>
      )}

      {qrType === "whatsapp" && (
        <div className="vstack gap-2">
          <div>
            <label className="form-label">מספר טלפון</label>
            <input
              type="tel"
              value={qrInputs.whatsapp.phone}
              onChange={(e) =>
                handleInputChange("whatsapp.phone", e.target.value)
              }
              placeholder="+92 123 456 7890"
              className="form-control form-control-lg"
            />
          </div>
          <div>
            <label className="form-label">הודעה</label>
            <textarea
              value={qrInputs.whatsapp.message}
              onChange={(e) =>
                handleInputChange("whatsapp.message", e.target.value)
              }
              placeholder="הודעה לשליחה..."
              className="form-control form-control-lg"
              rows="2"
            />
          </div>
          <div className="form-text">פותח שיחת WhatsApp עם ההודעה הזו</div>
        </div>
      )}

      {qrType === "email" && (
        <div className="vstack gap-2">
          <div>
            <label className="form-label">כתובת אימייל</label>
            <input
              type="email"
              value={qrInputs.email.email}
              onChange={(e) =>
                handleInputChange("email.email", e.target.value)
              }
              placeholder="your@email.com"
              className="form-control form-control-lg"
            />
          </div>
          <div>
            <label className="form-label">נושא (אופציונלי)</label>
            <input
              type="text"
              value={qrInputs.email.subject}
              onChange={(e) =>
                handleInputChange("email.subject", e.target.value)
              }
              placeholder="נושא האימייל..."
              className="form-control form-control-lg"
            />
          </div>
          <div>
            <label className="form-label">הודעה (אופציונלי)</label>
            <textarea
              value={qrInputs.email.message}
              onChange={(e) =>
                handleInputChange("email.message", e.target.value)
              }
              placeholder="תוכן האימייל..."
              className="form-control form-control-lg"
              rows="2"
            />
          </div>
          <div className="form-text">פותח את אפליקציית האימייל עם תוכן מוכן</div>
        </div>
      )}

      {qrType === "phone" && (
        <div>
          <input
            type="tel"
            value={qrInputs.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+92 123 456 7890"
            className="form-control form-control-lg"
          />
          <div className="form-text">הזן מספר טלפון לחיוג</div>
        </div>
      )}

      {qrType === "sms" && (
        <div className="vstack gap-2">
          <div>
            <label className="form-label">מספר טלפון</label>
            <input
              type="tel"
              value={qrInputs.sms.phone}
              onChange={(e) => handleInputChange("sms.phone", e.target.value)}
              placeholder="+972 123 456 789"
              className="form-control form-control-lg"
            />
          </div>
          <div>
            <label className="form-label">הודעה</label>
            <textarea
              value={qrInputs.sms.message}
              onChange={(e) =>
                handleInputChange("sms.message", e.target.value)
              }
              placeholder="תוכן הודעת ה-SMS..."
              className="form-control form-control-lg"
              rows="2"
            />
          </div>
          <div className="form-text">
            פותח את אפליקציית ה-SMS עם ההודעה הזו
          </div>
        </div>
      )}

      {qrType === "wifi" && (
        <div className="vstack gap-2">
          <div>
            <label className="form-label">שם הרשת (SSID)</label>
            <input
              type="text"
              value={qrInputs.wifi.ssid}
              onChange={(e) => handleInputChange("wifi.ssid", e.target.value)}
              placeholder="שם הרשת"
              className="form-control form-control-lg"
            />
          </div>
          <div>
            <label className="form-label">סיסמה</label>
            <input
              type="text"
              value={qrInputs.wifi.password}
              onChange={(e) =>
                handleInputChange("wifi.password", e.target.value)
              }
              placeholder="סיסמת WiFi"
              className="form-control form-control-lg"
            />
          </div>
          <div>
            <label className="form-label">סוג אבטחה</label>
            <select
              value={qrInputs.wifi.security}
              onChange={(e) =>
                handleInputChange("wifi.security", e.target.value)
              }
              className="form-select form-select-lg"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">פתוח (ללא סיסמה)</option>
            </select>
          </div>
          <div className="form-text">סרוק להתחברות אוטומטית ל-WiFi</div>
        </div>
      )}

      {qrType === "contact" && (
        <div className="vstack gap-2">
          <div>
            <label className="form-label">שם מלא</label>
            <input
              type="text"
              value={qrInputs.contact.name}
              onChange={(e) =>
                handleInputChange("contact.name", e.target.value)
              }
              placeholder="השם שלך"
              className="form-control form-control-lg"
            />
          </div>
          <div>
            <label className="form-label">טלפון</label>
            <input
              type="tel"
              value={qrInputs.contact.phone}
              onChange={(e) =>
                handleInputChange("contact.phone", e.target.value)
              }
              placeholder="+972 123 456 789"
              className="form-control form-control-lg"
            />
          </div>
          <div>
            <label className="form-label">אימייל</label>
            <input
              type="email"
              value={qrInputs.contact.email}
              onChange={(e) =>
                handleInputChange("contact.email", e.target.value)
              }
              placeholder="email@example.com"
              className="form-control form-control-lg"
            />
          </div>
          <div className="form-text">סרוק לשמירת איש קשר</div>
        </div>
      )}

      {qrType === "facebook" && (
        <div>
          <label className="form-label">שם משתמש בפייסבוק</label>
          <input
            type="text"
            value={qrInputs.facebook}
            onChange={(e) => handleInputChange("facebook", e.target.value)}
            placeholder="שם_המשתמש_שלך"
            className="form-control form-control-lg"
          />
          <div className="form-text">קישור לפרופיל הפייסבוק שלך</div>
        </div>
      )}

      {qrType === "instagram" && (
        <div>
          <label className="form-label">שם משתמש באינסטגרם</label>
          <input
            type="text"
            value={qrInputs.instagram}
            onChange={(e) => handleInputChange("instagram", e.target.value)}
            placeholder="שם_המשתמש_שלך"
            className="form-control form-control-lg"
          />
          <div className="form-text">קישור לפרופיל האינסטגרם שלך</div>
        </div>
      )}

      {qrType === "twitter" && (
        <div>
          <label className="form-label">שם משתמש ב-X/Twitter</label>
          <input
            type="text"
            value={qrInputs.twitter}
            onChange={(e) => handleInputChange("twitter", e.target.value)}
            placeholder="שם_המשתמש_שלך"
            className="form-control form-control-lg"
          />
          <div className="form-text">קישור לפרופיל ה-X/Twitter שלך</div>
        </div>
      )}

      {qrType === "linkedin" && (
        <div>
          <label className="form-label">שם משתמש בלינקדאין</label>
          <input
            type="text"
            value={qrInputs.linkedin}
            onChange={(e) => handleInputChange("linkedin", e.target.value)}
            placeholder="שם_המשתמש_שלך"
            className="form-control form-control-lg"
          />
          <div className="form-text">קישור לפרופיל הלינקדאין שלך</div>
        </div>
      )}

      {qrType === "youtube" && (
        <div>
          <label className="form-label">מזהה YouTube</label>
          <input
            type="text"
            value={qrInputs.youtube}
            onChange={(e) => handleInputChange("youtube", e.target.value)}
            placeholder="הערוץ_שלך"
            className="form-control form-control-lg"
          />
          <div className="form-text">קישור לערוץ ה-YouTube שלך</div>
        </div>
      )}

      {qrType === "tiktok" && (
        <div>
          <label className="form-label">שם משתמש בטיקטוק</label>
          <input
            type="text"
            value={qrInputs.tiktok}
            onChange={(e) => handleInputChange("tiktok", e.target.value)}
            placeholder="שם_המשתמש_שלך"
            className="form-control form-control-lg"
          />
          <div className="form-text">קישור לפרופיל הטיקטוק שלך</div>
        </div>
      )}

      {qrType !== "url" && qrType !== "pdf" ? (
        <div className="qr-segmented-row mt-2">
          <QrLinkModeToggle
            linkMode={linkMode}
            onChange={onLinkModeChange}
          />
        </div>
      ) : null}
    </>
  );
}

export default QrContentStep;
