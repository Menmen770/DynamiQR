import QrCustomColorButton from "../QrCustomColorButton";
import QrGradientPicker from "./QrGradientPicker";

function QrStyleColorTab({
  qrColorMode,
  setQrColorMode,
  fgColor,
  setFgColor,
  dotsGradient,
  setDotsGradient,
  bgColor,
  setBgColor,
  bgColorMode,
  setBgColorMode,
  bgGradient,
  setBgGradient,
  qrPresetColors,
  bgPresetColors,
  qrGradientPresets,
  bgGradientPresets,
}) {
  const bgModeClass = (mode) =>
    `nav-link ${bgColorMode === mode ? "active" : ""}`;
  const qrColorModeClass = (mode) =>
    `nav-link ${qrColorMode === mode ? "active" : ""}`;

  return (
    <div className="vstack gap-4">
      <div className="qr-color-section">
        <div className="qr-bg-mode-row mb-3 w-100">
          <label className="form-label fw-bold mb-0 w-100 text-end d-block">
            צבע ה-QR
          </label>

          <ul
            className="nav nav-pills qr-tabs qr-bg-mode-tabs justify-content-center flex-wrap w-100 mb-0"
            role="tablist"
            aria-label="סגנון צבע ה-QR"
          >
            <li className="nav-item" role="presentation">
              <button
                type="button"
                className={qrColorModeClass("solid")}
                aria-label="צבע QR אחיד"
                onClick={() => setQrColorMode("solid")}
              >
                צבע אחיד
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                type="button"
                className={qrColorModeClass("gradient")}
                aria-label="צבע QR בגרדיאנט"
                onClick={() => setQrColorMode("gradient")}
              >
                גרדיאנט
              </button>
            </li>
          </ul>
        </div>

        {qrColorMode === "solid" ? (
          <div className="d-flex gap-2 flex-wrap qr-color-palette">
            {qrPresetColors.map((color) => (
              <button
                key={color.hex}
                type="button"
                aria-label={`צבע QR: ${color.name}`}
                onClick={() => setFgColor(color.hex)}
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: color.hex,
                  border:
                    fgColor === color.hex ? "3px solid #0a9396" : "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow:
                    fgColor === color.hex
                      ? "0 4px 12px rgba(10, 147, 150, 0.4)"
                      : "none",
                  padding: 0,
                }}
                title={color.name}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              />
            ))}
            <QrCustomColorButton
              value={fgColor}
              onChange={setFgColor}
              title="צבע מותאם אישית"
              variant="foreground"
            />
          </div>
        ) : (
          <QrGradientPicker
            presets={qrGradientPresets}
            gradient={dotsGradient}
            onChange={setDotsGradient}
            fallbackColors={["#0a9396", "#005f73"]}
            angleLabel="זווית גרדיאנט"
          />
        )}
      </div>

      <hr className="my-2" />
      <div className="qr-bg-section">
        <div className="qr-bg-mode-row mb-3 w-100">
          <label className="form-label fw-bold mb-0 w-100 text-end d-block">
            רקע
          </label>

          <ul
            className="nav nav-pills qr-tabs qr-bg-mode-tabs justify-content-center flex-wrap w-100 mb-0"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <button
                type="button"
                className={bgModeClass("none")}
                aria-label="מצב רקע: ללא רקע"
                onClick={() => setBgColorMode("none")}
              >
                ללא רקע
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                type="button"
                className={bgModeClass("solid")}
                aria-label="מצב רקע: צבע אחיד"
                onClick={() => setBgColorMode("solid")}
              >
                צבע אחיד
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                type="button"
                className={bgModeClass("gradient")}
                aria-label="מצב רקע: גרדיאנט מותאם"
                onClick={() => setBgColorMode("gradient")}
              >
                גרדיאנט
              </button>
            </li>
          </ul>
        </div>

        {bgColorMode !== "none" && (
          <div className="d-flex gap-2 flex-wrap qr-color-palette">
            {bgColorMode === "solid" ? (
              <>
                {bgPresetColors.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    aria-label={`צבע רקע: ${color.name}`}
                    onClick={() => setBgColor(color.hex)}
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: color.hex,
                      border:
                        bgColor === color.hex ? "3px solid #0a9396" : "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow:
                        bgColor === color.hex
                          ? "0 4px 12px rgba(10, 147, 150, 0.4)"
                          : "none",
                      padding: 0,
                    }}
                    title={color.name}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  />
                ))}
                <QrCustomColorButton
                  value={bgColor}
                  onChange={setBgColor}
                  title="צבע מותאם אישית"
                  variant="background"
                />
              </>
            ) : (
              <QrGradientPicker
                presets={bgGradientPresets}
                gradient={bgGradient}
                onChange={setBgGradient}
                fallbackColors={["#fff7ed", "#fdba74"]}
                angleLabel="כיוון הרקע"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QrStyleColorTab;
