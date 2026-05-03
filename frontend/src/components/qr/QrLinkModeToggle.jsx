import { useId } from "react";
import QrStaticDynamicHelpButton from "./QrStaticDynamicHelpButton";

/** בורר סטטי / דינמי — פס כפתורים + כפתור עזרה (?). */
export default function QrLinkModeToggle({ linkMode, onChange }) {
  const groupId = useId();
  const staticId = `${groupId}-static`;
  const dynamicId = `${groupId}-dynamic`;

  return (
    <div className="qr-link-mode-row">
      <div
        className="qr-link-mode-group"
        role="radiogroup"
        aria-label="סטטי או דינמי"
      >
        <span className="qr-link-mode-slider" aria-hidden />
        <div className="qr-link-mode-option">
          <input
            type="radio"
            name={`qr-link-mode-${groupId}`}
            id={staticId}
            checked={linkMode !== "dynamic"}
            onChange={() => onChange("static")}
          />
          <label className="qr-link-mode-option-label" htmlFor={staticId}>
            סטטי
          </label>
        </div>
        <div className="qr-link-mode-option">
          <input
            type="radio"
            className="qr-seg-right"
            name={`qr-link-mode-${groupId}`}
            id={dynamicId}
            checked={linkMode === "dynamic"}
            onChange={() => onChange("dynamic")}
          />
          <label className="qr-link-mode-option-label" htmlFor={dynamicId}>
            דינמי
          </label>
        </div>
      </div>
      <QrStaticDynamicHelpButton />
    </div>
  );
}
