import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQrGenerator } from "../hooks";
import {
  BG_EFFECTS,
  PRESET_QR_COLORS,
  PRESET_BG_COLORS,
  STICKER_OPTIONS,
  QR_TYPES_MAIN,
  QR_TYPES_MORE,
  getEffectBackground,
} from "../utils/qrConstants";
import WhyUsSection from "../components/WhyUsSection";
import PromotionalMaterialsSection from "../components/PromotionalMaterialsSection";
import QrTutorialTimeline from "../components/QrTutorialTimeline";
import {
  QrTypeSelector,
  QrContentStep,
  QrStylePanel,
  QrPreviewPanel,
  getStepOneTitle,
} from "../components/qr";

function QrPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const qr = useQrGenerator();

  const {
    qrType,
    bgColor,
    setBgColor,
    fgColor,
    setFgColor,
    qrImage,
    previewImage,
    loading,
    error,
    bgColorMode,
    setBgColorMode,
    bgEffect,
    setBgEffect,
    pdfFile,
    setPdfFile,
    isDragging,
    pdfInputMode,
    setPdfInputMode,
    dotsType,
    setDotsType,
    cornersType,
    setCornersType,
    logoUrl,
    setLogoUrl,
    logoFile,
    setLogoFile,
    isLogoDragging,
    logoInputMode,
    setLogoInputMode,
    logoShape,
    setLogoShape,
    stickerType,
    setStickerType,
    qrInputs,
    handleQRTypeChange,
    handleInputChange,
    handlePdfDrop,
    handlePdfDragOver,
    handlePdfDragLeave,
    handlePdfFileSelect,
    handleLogoDrop,
    handleLogoDragOver,
    handleLogoDragLeave,
    handleLogoFileSelect,
    downloadQR,
    saveQr,
    saveQrSaving,
    saveQrMessage,
    applySavedQrPayload,
    linkMode,
    handleLinkModeChange,
    publicSlug,
  } = qr;

  useEffect(() => {
    const payload = location.state?.loadSavedQr;
    if (!payload) return;
    applySavedQrPayload(payload);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, applySavedQrPayload, navigate, location.pathname]);

  const [activeTab, setActiveTab] = useState("color");
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const stepOneTitle = getStepOneTitle(qrType);

  return (
    <div className="qr-page">
      <main className="container py-4">
        <section className="text-center mb-5">
          <h1 className="display-5 fw-bold">מחולל QR בעיצוב אישי</h1>
          <p className="lead text-muted">
            ליצור, לעצב ולהוריד קודי QR בממשק מודרני, מהיר ובחינם.
          </p>
        </section>

        <div id="qr-generator">
          <QrTypeSelector
            qrType={qrType}
            qrTypesMain={QR_TYPES_MAIN}
            qrTypesMore={QR_TYPES_MORE}
            showMoreOptions={showMoreOptions}
            setShowMoreOptions={setShowMoreOptions}
            onSelectType={handleQRTypeChange}
          />

          <div className="row g-4" style={{ alignItems: "stretch" }}>
          <div className="col-lg-7 d-flex flex-column gap-4">
            <div className="card qr-card shadow-sm flex-grow-1">
              <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="qr-step">1</span>
                  <h5 className="mb-0">{stepOneTitle}</h5>
                </div>

                <QrContentStep
                  qrType={qrType}
                  qrInputs={qrInputs}
                  handleInputChange={handleInputChange}
                  pdfFile={pdfFile}
                  setPdfFile={setPdfFile}
                  isDragging={isDragging}
                  pdfInputMode={pdfInputMode}
                  setPdfInputMode={setPdfInputMode}
                  handlePdfDrop={handlePdfDrop}
                  handlePdfDragOver={handlePdfDragOver}
                  handlePdfDragLeave={handlePdfDragLeave}
                  handlePdfFileSelect={handlePdfFileSelect}
                />
              </div>
            </div>

            <QrStylePanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              fgColor={fgColor}
              setFgColor={setFgColor}
              bgColor={bgColor}
              setBgColor={setBgColor}
              bgColorMode={bgColorMode}
              setBgColorMode={setBgColorMode}
              bgEffect={bgEffect}
              setBgEffect={setBgEffect}
              qrPresetColors={PRESET_QR_COLORS}
              bgPresetColors={PRESET_BG_COLORS}
              bgEffects={BG_EFFECTS}
              getEffectBackground={getEffectBackground}
              dotsType={dotsType}
              setDotsType={setDotsType}
              cornersType={cornersType}
              setCornersType={setCornersType}
              stickerOptions={STICKER_OPTIONS}
              stickerType={stickerType}
              setStickerType={setStickerType}
              logoInputMode={logoInputMode}
              setLogoInputMode={setLogoInputMode}
              logoShape={logoShape}
              setLogoShape={setLogoShape}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
              logoFile={logoFile}
              setLogoFile={setLogoFile}
              isLogoDragging={isLogoDragging}
              handleLogoDrop={handleLogoDrop}
              handleLogoDragOver={handleLogoDragOver}
              handleLogoDragLeave={handleLogoDragLeave}
              handleLogoFileSelect={handleLogoFileSelect}
              loading={loading}
            />
          </div>

          <QrPreviewPanel
            qrType={qrType}
            qrInputs={qrInputs}
            pdfInputMode={pdfInputMode}
            pdfFile={pdfFile}
            previewImage={previewImage}
            qrImage={qrImage}
            error={error}
            loading={loading}
            bgColorMode={bgColorMode}
            bgEffect={bgEffect}
            bgColor={bgColor}
            stickerType={stickerType}
            getEffectBackground={getEffectBackground}
            downloadQR={downloadQR}
            saveQr={saveQr}
            saveQrSaving={saveQrSaving}
            saveQrMessage={saveQrMessage}
            linkMode={linkMode}
            handleLinkModeChange={handleLinkModeChange}
            publicSlug={publicSlug}
          />
          </div>
        </div>

        <WhyUsSection />
        <PromotionalMaterialsSection />

        <section className="qr-home-howto" dir="rtl" aria-label="איך יוצרים קוד QR">
          <QrTutorialTimeline
            footer={
              <button
                type="button"
                className="qr-home-create-cta"
                onClick={() =>
                  document
                    .getElementById("qr-generator")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                צור QR עכשיו
              </button>
            }
          />
        </section>
      </main>
    </div>
  );
}

export default QrPage;
