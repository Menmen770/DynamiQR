import { QR_EDGE_IMAGES, QR_BODY_IMAGES } from "./qrShapeAssets";
import { BODY_SHAPES, CORNER_SHAPES } from "../../utils/qrConstants";

function QrStyleShapeTab({ dotsType, setDotsType, cornersType, setCornersType }) {
  const bodyShapes = BODY_SHAPES;
  const cornerShapes = CORNER_SHAPES;

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
    </div>
  );
}

export default QrStyleShapeTab;
