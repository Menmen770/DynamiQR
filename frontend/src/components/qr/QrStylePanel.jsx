import QrStyleColorTab from "./QrStyleColorTab";
import QrStyleShapeTab from "./QrStyleShapeTab";
import QrStyleStickerTab from "./QrStyleStickerTab";
import QrStyleLogoTab from "./QrStyleLogoTab";

/**
 * שלב 2: לשוניות עיצוב (צבע, צורה, לוגו, סטיקר).
 */
function QrStylePanel({
  activeTab,
  setActiveTab,
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
  dotsType,
  setDotsType,
  cornersType,
  setCornersType,
  errorCorrectionLevel,
  setErrorCorrectionLevel,
  stickerOptions,
  stickerType,
  setStickerType,
  logoInputMode,
  setLogoInputMode,
  logoShape,
  setLogoShape,
  logoInsetScale,
  setLogoInsetScale,
  logoUrl,
  setLogoUrl,
  logoFile,
  setLogoFile,
  isLogoDragging,
  handleLogoDrop,
  handleLogoDragOver,
  handleLogoDragLeave,
  handleLogoFileSelect,
}) {
  const tabClass = (tabName) =>
    `nav-link ${activeTab === tabName ? "active" : ""}`;

  return (
    <div className="card qr-card shadow-sm flex-grow-1">
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex align-items-center gap-3 mb-3">
          <span className="qr-step">2</span>
          <h5 className="mb-0">התאם את העיצוב</h5>
        </div>

        <div className="qr-style-panel-layout d-flex flex-column gap-3 align-items-stretch min-w-0">
          <ul
            className="nav nav-pills qr-tabs qr-style-tabs-rail flex-row flex-wrap justify-content-center w-100 mb-0"
            role="tablist"
            aria-label="לשוניות עיצוב"
          >
            <li className="nav-item" role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "color"}
                className={tabClass("color")}
                aria-label="עיצוב: צבע"
                onClick={() => setActiveTab("color")}
              >
                צבע
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "shape"}
                className={tabClass("shape")}
                aria-label="עיצוב: צורת נקודות ופינות"
                onClick={() => setActiveTab("shape")}
              >
                צורה
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "logo"}
                className={tabClass("logo")}
                aria-label="עיצוב: לוגו במרכז"
                onClick={() => {
                  setActiveTab("logo");
                  setLogoShape("circle");
                }}
              >
                לוגו
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "sticker"}
                className={tabClass("sticker")}
                aria-label="עיצוב: מסגרת סטיקר"
                onClick={() => setActiveTab("sticker")}
              >
                סטיקר
              </button>
            </li>
          </ul>

          <div className="qr-style-panel-body flex-grow-1 min-w-0">
        {activeTab === "color" && (
          <QrStyleColorTab
            qrColorMode={qrColorMode}
            setQrColorMode={setQrColorMode}
            fgColor={fgColor}
            setFgColor={setFgColor}
            dotsGradient={dotsGradient}
            setDotsGradient={setDotsGradient}
            bgColor={bgColor}
            setBgColor={setBgColor}
            bgColorMode={bgColorMode}
            setBgColorMode={setBgColorMode}
            bgGradient={bgGradient}
            setBgGradient={setBgGradient}
            qrPresetColors={qrPresetColors}
            bgPresetColors={bgPresetColors}
            qrGradientPresets={qrGradientPresets}
            bgGradientPresets={bgGradientPresets}
          />
        )}

        {activeTab === "shape" && (
          <QrStyleShapeTab
            dotsType={dotsType}
            setDotsType={setDotsType}
            cornersType={cornersType}
            setCornersType={setCornersType}
            errorCorrectionLevel={errorCorrectionLevel}
            setErrorCorrectionLevel={setErrorCorrectionLevel}
          />
        )}

        {activeTab === "sticker" && (
          <QrStyleStickerTab
            stickerOptions={stickerOptions}
            stickerType={stickerType}
            setStickerType={setStickerType}
          />
        )}

        {activeTab === "logo" && (
          <QrStyleLogoTab
            logoInputMode={logoInputMode}
            setLogoInputMode={setLogoInputMode}
            logoShape={logoShape}
            setLogoShape={setLogoShape}
            logoInsetScale={logoInsetScale}
            setLogoInsetScale={setLogoInsetScale}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            logoFile={logoFile}
            setLogoFile={setLogoFile}
            isLogoDragging={isLogoDragging}
            handleLogoDrop={handleLogoDrop}
            handleLogoDragOver={handleLogoDragOver}
            handleLogoDragLeave={handleLogoDragLeave}
            handleLogoFileSelect={handleLogoFileSelect}
          />
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QrStylePanel;
