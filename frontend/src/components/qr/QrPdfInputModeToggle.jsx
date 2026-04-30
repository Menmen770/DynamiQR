import { useId } from "react";

/** העלאת קובץ / הדבקת URL — אותו עיצוב פס מעוגל כמו סטטי/דינמי. */
export default function QrPdfInputModeToggle({ pdfInputMode, onChange }) {
  const groupId = useId();
  const fileId = `${groupId}-file`;
  const urlId = `${groupId}-url`;

  return (
    <div
      className="qr-link-mode-group"
      role="radiogroup"
      aria-label="מקור קובץ PDF"
    >
      <span className="qr-link-mode-slider" aria-hidden />
      <div className="qr-link-mode-option">
        <input
          type="radio"
          name={`qr-pdf-input-${groupId}`}
          id={fileId}
          checked={pdfInputMode === "file"}
          onChange={() => onChange("file")}
        />
        <label className="qr-link-mode-option-label" htmlFor={fileId}>
          העלאת קובץ
        </label>
      </div>
      <div className="qr-link-mode-option">
        <input
          type="radio"
          className="qr-seg-right"
          name={`qr-pdf-input-${groupId}`}
          id={urlId}
          checked={pdfInputMode === "url"}
          onChange={() => onChange("url")}
        />
        <label className="qr-link-mode-option-label" htmlFor={urlId}>
          הדבקת URL
        </label>
      </div>
    </div>
  );
}
