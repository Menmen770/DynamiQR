import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQrGenerator } from "../hooks";
import {
  PRESET_QR_COLORS,
  PRESET_BG_COLORS,
  STICKER_OPTIONS,
  QR_TYPES_MAIN,
  QR_TYPES_MORE,
} from "../utils/qrConstants";
import {
  BG_GRADIENT_PRESETS,
  QR_GRADIENT_PRESETS,
} from "../utils/qrGradients";
import { BRAND_HERO_HE } from "../constants/brand";
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
    qrColorMode,
    setQrColorMode,
    dotsGradient,
    setDotsGradient,
    qrImage,
    previewImage,
    loading,
    error,
    bgColorMode,
    setBgColorMode,
    bgGradient,
    setBgGradient,
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
    logoInsetScale,
    setLogoInsetScale,
    stickerType,
    setStickerType,
    errorCorrectionLevel,
    setErrorCorrectionLevel,
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
          <h1 className="display-5 fw-bold">{BRAND_HERO_HE}</h1>
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
            <div className="card qr-card qr-step1-card shadow-sm w-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2 mb-2 qr-step1-heading">
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
                  linkMode={linkMode}
                  onLinkModeChange={handleLinkModeChange}
                />
              </div>
            </div>

            <QrStylePanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
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
              qrPresetColors={PRESET_QR_COLORS}
              bgPresetColors={PRESET_BG_COLORS}
              qrGradientPresets={QR_GRADIENT_PRESETS}
              bgGradientPresets={BG_GRADIENT_PRESETS}
              dotsType={dotsType}
              setDotsType={setDotsType}
              cornersType={cornersType}
              setCornersType={setCornersType}
              errorCorrectionLevel={errorCorrectionLevel}
              setErrorCorrectionLevel={setErrorCorrectionLevel}
              stickerOptions={STICKER_OPTIONS}
              stickerType={stickerType}
              setStickerType={setStickerType}
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
            bgGradient={bgGradient}
            bgColor={bgColor}
            stickerType={stickerType}
            downloadQR={downloadQR}
            saveQr={saveQr}
            saveQrSaving={saveQrSaving}
            saveQrMessage={saveQrMessage}
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
                className="dashboard-create-layered"
                onClick={() =>
                  document
                    .getElementById("qr-generator")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                יצירת QR חדש
              </button>
            }
          />
        </section>
      </main>
    </div>
  );
}

export default QrPage;
