import QrCustomColorButton from "../QrCustomColorButton";

function QrStyleColorTab({
  fgColor,
  setFgColor,
  bgColor,
  setBgColor,
  bgColorMode,
  setBgColorMode,
  bgEffect,
  setBgEffect,
  qrPresetColors,
  bgPresetColors,
  bgEffects,
  getEffectBackground,
}) {
  const bgModeClass = (mode) =>
    `nav-link ${bgColorMode === mode ? "active" : ""}`;

  return (
    <div className="vstack gap-4">
      <div className="qr-color-section">
        <label className="form-label fw-bold mb-3 text-end d-block w-100">
          צבע ה-QR
        </label>

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
                className={bgModeClass("effect")}
                aria-label="מצב רקע: אפקט גרדיאנט"
                onClick={() => setBgColorMode("effect")}
              >
                אפקט
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
              <>
                {bgEffects
                  .filter((effect) => effect.id !== "none")
                  .map((effect) => (
                    <button
                      key={effect.id}
                      type="button"
                      aria-label={`אפקט רקע: ${effect.name}`}
                      aria-pressed={bgEffect === effect.id}
                      onClick={() => {
                        if (bgEffect === effect.id) {
                          setBgEffect("none");
                        } else {
                          setBgEffect(effect.id);
                        }
                      }}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        border:
                          bgEffect === effect.id
                            ? "3px solid #0a9396"
                            : "2px solid #e8e8e8",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        background: getEffectBackground(effect.id),
                        boxShadow:
                          bgEffect === effect.id
                            ? "0 4px 12px rgba(10, 147, 150, 0.4)"
                            : "none",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#ffffff",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                      }}
                      title={effect.name}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                    />
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QrStyleColorTab;
