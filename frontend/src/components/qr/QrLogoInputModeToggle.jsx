import { useId } from "react";
import { FiFileText, FiGrid, FiLink } from "react-icons/fi";

/**
 * מקור לוגו: מוכנים / העלאה / URL — עיצוב פס כמו סטטי/דינמי (3 מקטעים).
 */
export default function QrLogoInputModeToggle({ mode, onChange }) {
  const groupId = useId();
  const presetId = `${groupId}-preset`;
  const fileId = `${groupId}-file`;
  const urlId = `${groupId}-url`;
  const name = `qr-logo-input-mode-${groupId}`;

  return (
    <div
      className="qr-link-mode-group qr-link-mode-group--3"
      role="radiogroup"
      aria-label="מקור לוגו"
    >
      <span className="qr-link-mode-slider" aria-hidden />
      <div className="qr-link-mode-option">
        <input
          type="radio"
          className="qr-logo-mode-preset"
          name={name}
          id={presetId}
          checked={mode === "preset"}
          onChange={() => onChange("preset")}
        />
        <label
          className="qr-link-mode-option-label qr-link-mode-option-label--icon"
          htmlFor={presetId}
        >
          <FiGrid className="qr-logo-seg-icon" aria-hidden />
          <span>לוגואים מוכנים</span>
        </label>
      </div>
      <div className="qr-link-mode-option">
        <input
          type="radio"
          className="qr-logo-mode-file"
          name={name}
          id={fileId}
          checked={mode === "file"}
          onChange={() => onChange("file")}
        />
        <label
          className="qr-link-mode-option-label qr-link-mode-option-label--icon"
          htmlFor={fileId}
        >
          <FiFileText className="qr-logo-seg-icon" aria-hidden />
          <span>העלאת תמונה</span>
        </label>
      </div>
      <div className="qr-link-mode-option">
        <input
          type="radio"
          className="qr-logo-mode-url"
          name={name}
          id={urlId}
          checked={mode === "url"}
          onChange={() => onChange("url")}
        />
        <label
          className="qr-link-mode-option-label qr-link-mode-option-label--icon"
          htmlFor={urlId}
        >
          <FiLink className="qr-logo-seg-icon" aria-hidden />
          <span>הדבקת URL</span>
        </label>
      </div>
    </div>
  );
}
