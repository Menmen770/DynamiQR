import { useId } from "react";
import { QR_EDGE_IMAGES, QR_BODY_IMAGES } from "./qrShapeAssets";
import {
  BODY_SHAPES,
  CORNER_SHAPES,
  ERROR_CORRECTION_LEVELS,
} from "../../utils/qrConstants";

function QrStyleShapeTab({
  dotsType,
  setDotsType,
  cornersType,
  setCornersType,
  errorCorrectionLevel,
  setErrorCorrectionLevel,
}) {
  const ecGroupId = useId();
  const bodyShapes = BODY_SHAPES;
  const cornerShapes = CORNER_SHAPES;
  const ecIndex = Math.max(
    0,
    ERROR_CORRECTION_LEVELS.findIndex((level) => level.id === errorCorrectionLevel),
  );
  const currentEc = ERROR_CORRECTION_LEVELS[ecIndex] || ERROR_CORRECTION_LEVELS[0];
  const ecPalettes = [
    {
      background: "linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)",
      color: "#991b1b",
      borderColor: "rgba(248, 113, 113, 0.45)",
      shadow: "0 8px 18px rgba(248, 113, 113, 0.24)",
    },
    {
      background: "linear-gradient(135deg, #ffedd5 0%, #fdba74 100%)",
      color: "#9a3412",
      borderColor: "rgba(251, 146, 60, 0.42)",
      shadow: "0 8px 18px rgba(251, 146, 60, 0.22)",
    },
    {
      background: "linear-gradient(135deg, #fef3c7 0%, #86efac 100%)",
      color: "#854d0e",
      borderColor: "rgba(250, 204, 21, 0.36)",
      shadow: "0 8px 18px rgba(245, 158, 11, 0.18)",
    },
    {
      background: "linear-gradient(135deg, #bbf7d0 0%, #99f6e4 100%)",
      color: "#065f46",
      borderColor: "rgba(45, 212, 191, 0.4)",
      shadow: "0 8px 18px rgba(45, 212, 191, 0.2)",
    },
  ];

  return (
    <div className="vstack gap-4">
      <div className="qr-shape-section">
        <div
          className="qr-shape-label-row d-flex flex-wrap align-items-center gap-3 w-100"
          dir="rtl"
        >
          <label className="form-label fw-semibold mb-0 flex-shrink-0">
            סוג גוף
          </label>
          <div className="d-flex flex-wrap gap-3 flex-grow-1 justify-content-start min-w-0">
            {bodyShapes.map((shape, index) => (
              <button
                type="button"
                className={`edge-select-btn ${dotsType === shape.id ? "selected" : ""}`}
                onClick={() => setDotsType(shape.id)}
                title={shape.name}
                aria-label={`סוג גוף QR: ${shape.name}`}
                aria-pressed={dotsType === shape.id}
                key={shape.id}
              >
                <img
                  src={QR_BODY_IMAGES[index + 1]}
                  alt={shape.name}
                  className="edge-preview-img"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <hr className="my-2" />

      <div className="qr-shape-section">
        <div
          className="qr-shape-label-row d-flex flex-wrap align-items-center gap-3 w-100"
          dir="rtl"
        >
          <label className="form-label fw-semibold mb-0 flex-shrink-0">
            פינות
          </label>
          <div className="d-flex flex-wrap gap-3 flex-grow-1 justify-content-start min-w-0">
            {cornerShapes.map((shape, index) => {
              const imageNum = index + 1;
              return (
                <button
                  type="button"
                  className={`edge-select-btn ${cornersType === shape.id ? "selected" : ""}`}
                  onClick={() => setCornersType(shape.id)}
                  title={shape.name}
                  aria-label={`צורת פינות QR: ${shape.name}`}
                  aria-pressed={cornersType === shape.id}
                  key={shape.id}
                >
                  <img
                    src={QR_EDGE_IMAGES[imageNum]}
                    alt={shape.name}
                    className="edge-preview-img"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <hr className="my-2" />

      <div className="qr-shape-section">
        <div className="qr-ec-compact-row">
          <div className="qr-ec-compact-copy">
            <label className="form-label fw-semibold mb-0">איכות סריקה</label>
            <span className="qr-ec-compact-hint">{currentEc.description}</span>
          </div>

          <div
            className="qr-ec-compact-group"
            role="radiogroup"
            aria-label="בחירת איכות סריקה"
          >
            {ERROR_CORRECTION_LEVELS.map((level, index) => {
              const selected = level.id === currentEc.id;
              const inputId = `${ecGroupId}-${level.id}`;
              const palette = ecPalettes[index] || ecPalettes[0];
              return (
                <div className="qr-ec-compact-option" key={level.id}>
                  <input
                    type="radio"
                    name={`qr-ec-${ecGroupId}`}
                    id={inputId}
                    checked={selected}
                    onChange={() => setErrorCorrectionLevel(level.id)}
                  />
                  <label
                    htmlFor={inputId}
                    className={`qr-ec-compact-label ${selected ? "selected" : ""}`}
                    style={
                      selected
                        ? {
                            background: palette.background,
                            color: palette.color,
                            borderColor: palette.borderColor,
                            boxShadow: palette.shadow,
                          }
                        : undefined
                    }
                  >
                    {level.id}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QrStyleShapeTab;
