import { useEffect, useRef, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import {
  createLinearGradient,
  getGradientAngleDegrees,
  getGradientColors,
  gradientToCss,
  gradientsEqual,
} from "../../utils/qrGradients";

function QrGradientPicker({
  presets,
  gradient,
  onChange,
  fallbackColors,
  angleLabel = "זווית",
}) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("below");
  const wrapRef = useRef(null);
  const [startColor, endColor] = getGradientColors(gradient, fallbackColors);
  const angle = getGradientAngleDegrees(gradient, 135);

  const updateGradient = (next) => {
    onChange(next);
  };

  useEffect(() => {
    if (!open) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const updatePlacement = () => {
      const r = wrap.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      setPlacement(spaceBelow < 320 ? "above" : "below");
    };
    updatePlacement();
    window.addEventListener("scroll", updatePlacement, true);
    window.addEventListener("resize", updatePlacement);
    return () => {
      window.removeEventListener("scroll", updatePlacement, true);
      window.removeEventListener("resize", updatePlacement);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="qr-gradient-picker">
      <div className="d-flex gap-2 flex-wrap qr-color-palette" role="list" aria-label="פריסטים של גרדיאנט">
        {presets.map((preset) => {
          const selected = gradientsEqual(preset.gradient, gradient);
          return (
            <button
              key={preset.id}
              type="button"
              className="qr-gradient-swatch"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: selected ? "3px solid #0a9396" : "2px solid #e8e8e8",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: gradientToCss(preset.gradient),
                boxShadow: selected ? "0 4px 12px rgba(10, 147, 150, 0.4)" : "none",
                padding: 0,
              }}
              onClick={() => updateGradient(preset.gradient)}
              aria-pressed={selected}
              title={preset.name}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
          );
        })}

        <div className="qr-custom-color-wrap" ref={wrapRef}>
          <button
            type="button"
            className="qr-custom-color-trigger qr-gradient-custom-trigger"
            style={{ "--qr-custom-color": gradientToCss(gradient) }}
            title="גרדיאנט מותאם אישית"
            aria-label="גרדיאנט מותאם אישית"
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => setOpen((value) => !value)}
          >
            <FiEdit2
              size={20}
              color="#ffffff"
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
              }}
            />
          </button>

          {open && (
            <div
              className={`qr-custom-color-panel qr-gradient-custom-panel ${
                placement === "above" ? "qr-custom-color-panel--above" : ""
              }`}
              role="dialog"
              aria-label="בחירת גרדיאנט מותאם אישית"
            >
              <div className="qr-gradient-custom-controls">
                <label className="qr-gradient-color-field">
                  <span>התחלה</span>
                  <input
                    type="color"
                    value={startColor}
                    onChange={(e) =>
                      updateGradient(createLinearGradient(angle, [e.target.value, endColor]))
                    }
                  />
                </label>

                <label className="qr-gradient-color-field">
                  <span>סיום</span>
                  <input
                    type="color"
                    value={endColor}
                    onChange={(e) =>
                      updateGradient(createLinearGradient(angle, [startColor, e.target.value]))
                    }
                  />
                </label>
              </div>

              <label className="qr-gradient-angle-field">
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span>{angleLabel}</span>
                  <span className="small text-muted">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={angle}
                  onChange={(e) =>
                    updateGradient(
                      createLinearGradient(Number(e.target.value), [startColor, endColor]),
                    )
                  }
                />
              </label>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default QrGradientPicker;
