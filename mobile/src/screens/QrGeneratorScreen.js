import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  IconArrowLeft,
  IconArrowRight,
  IconDeviceFloppy,
  IconShare2,
} from "@tabler/icons-react-native";
import { useRoute } from "@react-navigation/native";
import { useQrGeneratorMobile } from "../hooks/useQrGeneratorMobile";
import { useAccessibility } from "../context/AccessibilityContext";
import ScreenWithAccessibility from "../components/ScreenWithAccessibility";
import ScreenPageHeader from "../components/ScreenPageHeader";
import QrPreviewComposite from "../components/QrPreviewComposite";
import QrTypeSelectorMobile from "../components/QrTypeSelectorMobile";
import QrContentStepMobile from "../components/QrContentStepMobile";
import QrStylePanelMobile from "../components/qr/QrStylePanelMobile";

const STEPS = [
  { id: "content", label: "תוכן", step: "1" },
  { id: "style", label: "עיצוב", step: "2" },
  { id: "export", label: "הורדה", step: "3" },
];

export default function QrGeneratorScreen() {
  const route = useRoute();
  const { colors } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeStep, setActiveStep] = useState("content");
  const [activeTab, setActiveTab] = useState("color");
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [saveName, setSaveName] = useState("");
  const previewCaptureRef = useRef(null);

  const qr = useQrGeneratorMobile(route.params?.loadPayload, previewCaptureRef);
  const {
    qrType,
    setQrType,
    qrInputs,
    handleInputChange,
    fgColor,
    setFgColor,
    qrColorMode,
    setQrColorMode,
    dotsGradient,
    setDotsGradient,
    bgColor,
    setBgColor,
    bgColorMode,
    setBgColorMode,
    bgGradient,
    setBgGradient,
    dotsType,
    setDotsType,
    cornersType,
    setCornersType,
    stickerType,
    setStickerType,
    logoShape,
    setLogoShape,
    logoInputMode,
    setLogoInputMode,
    logoUrl,
    setLogoUrl,
    setLogoInsetScale,
    logoLoadingPreset,
    selectPresetLogo,
    clearLogo,
    errorCorrectionLevel,
    setErrorCorrectionLevel,
    qrImage,
    loading,
    error,
    setError,
    saveQr,
    saveQrSaving,
    saveQrMessage,
    exportQr,
    exporting,
  } = qr;

  const previewProps = {
    colors,
    qrImage,
    loading,
    error,
    bgColorMode,
    bgSolidColor: bgColor,
    bgGradient,
    stickerType,
    fgColor,
    qrColorMode,
    dotsGradient,
  };

  const handleSave = async () => {
    const ok = await saveQr(saveName);
    if (ok) setSaveName("");
  };

  return (
    <ScreenWithAccessibility>
      <View style={styles.pageInner}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenPageHeader
            colors={colors}
            title="יצירת QR"
            subtitle="בחרו סוג, התאימו צבעים וגרדיאנטים, והורידו"
          />

          <View style={styles.stepIndicator}>
            {STEPS.map((s, idx) => {
              const active = activeStep === s.id;
              const done = STEPS.findIndex((x) => x.id === activeStep) > idx;
              return (
                <React.Fragment key={s.id}>
                  <TouchableOpacity
                    style={styles.stepItem}
                    onPress={() => setActiveStep(s.id)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.stepBadge,
                        active && styles.stepBadgeActive,
                        done && styles.stepBadgeDone,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepBadgeText,
                          (active || done) && styles.stepBadgeTextActive,
                        ]}
                      >
                        {s.step}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        active && styles.stepLabelActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                  {idx < STEPS.length - 1 ? (
                    <View
                      style={[styles.stepLine, done && styles.stepLineDone]}
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </View>

          {activeStep === "content" ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.stepTag}>
                  <Text style={styles.stepTagText}>1</Text>
                </View>
                <Text style={styles.cardTitle}>מה יופיע בקוד?</Text>
              </View>

              <QrTypeSelectorMobile
                colors={colors}
                qrType={qrType}
                onSelectType={setQrType}
              />

              <View style={styles.contentBox}>
                <QrContentStepMobile
                  colors={colors}
                  qrType={qrType}
                  qrInputs={qrInputs}
                  onInputChange={handleInputChange}
                />
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setActiveStep("style")}
              >
                <View style={styles.btnRow}>
                  <Text style={styles.primaryBtnText}>המשך לעיצוב</Text>
                  <IconArrowLeft
                    size={18}
                    color={colors.white}
                    strokeWidth={2.2}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {activeStep === "style" ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.stepTag}>
                  <Text style={styles.stepTagText}>2</Text>
                </View>
                <Text style={styles.cardTitle}>התאימו את העיצוב</Text>
              </View>

              <View style={styles.previewInline}>
                <QrPreviewComposite {...previewProps} previewSize={200} />
              </View>

              <QrStylePanelMobile
                colors={colors}
                activeTab={activeTab}
                onTabChange={setActiveTab}
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
                dotsType={dotsType}
                setDotsType={setDotsType}
                cornersType={cornersType}
                setCornersType={setCornersType}
                stickerType={stickerType}
                setStickerType={setStickerType}
                logoShape={logoShape}
                setLogoShape={setLogoShape}
                logoInputMode={logoInputMode}
                setLogoInputMode={setLogoInputMode}
                logoUrl={logoUrl}
                setLogoUrl={setLogoUrl}
                setLogoInsetScale={setLogoInsetScale}
                logoLoadingPreset={logoLoadingPreset}
                selectPresetLogo={selectPresetLogo}
                clearLogo={clearLogo}
                selectedPresetId={selectedPresetId}
                setSelectedPresetId={setSelectedPresetId}
                setError={setError}
                errorCorrectionLevel={errorCorrectionLevel}
                setErrorCorrectionLevel={setErrorCorrectionLevel}
              />

              <View style={styles.dualActions}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => setActiveStep("content")}
                >
                  <View style={styles.btnRow}>
                    <IconArrowRight
                      size={16}
                      color={colors.primary}
                      strokeWidth={2.2}
                    />
                    <Text style={styles.secondaryBtnText}>חזרה לתוכן</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, styles.primaryBtnHalf]}
                  onPress={() => setActiveStep("export")}
                >
                  <View style={styles.btnRow}>
                    <Text style={styles.primaryBtnText}>המשך להורדה</Text>
                    <IconArrowLeft
                      size={16}
                      color={colors.white}
                      strokeWidth={2.2}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {activeStep === "export" ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.stepTag}>
                  <Text style={styles.stepTagText}>3</Text>
                </View>
                <Text style={styles.cardTitle}>הורדה ושמירה</Text>
              </View>

              <QrPreviewComposite {...previewProps} />

              <TouchableOpacity
                style={[
                  styles.exportBtn,
                  (exporting || !qrImage) && styles.btnDisabled,
                ]}
                onPress={exportQr}
                disabled={exporting || !qrImage}
              >
                {exporting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.btnRow}>
                    <IconShare2
                      size={20}
                      color={colors.white}
                      strokeWidth={2.2}
                    />
                    <Text style={styles.exportBtnText}>שתף / שמור</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.saveBox}>
                <Text style={styles.saveLabel}>שמירה לאוסף (בחשבון)</Text>
                <TextInput
                  value={saveName}
                  onChangeText={setSaveName}
                  placeholder="שם לקוד, למשל: כרטיס ביקור"
                  style={styles.input}
                  textAlign="right"
                  placeholderTextColor={colors.subText}
                />
                <TouchableOpacity
                  style={[styles.saveBtn, saveQrSaving && styles.btnDisabled]}
                  onPress={handleSave}
                  disabled={saveQrSaving || !qrImage}
                >
                  {saveQrSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.btnRow}>
                      <IconDeviceFloppy
                        size={18}
                        color={colors.white}
                        strokeWidth={2.2}
                      />
                      <Text style={styles.saveBtnText}>שמור לאוסף</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {saveQrMessage ? (
                  <Text
                    style={[
                      styles.saveMsg,
                      saveQrMessage.includes("נשמר")
                        ? styles.saveMsgOk
                        : styles.saveMsgErr,
                    ]}
                  >
                    {saveQrMessage}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setActiveStep("style")}
              >
                <View style={styles.btnRow}>
                  <IconArrowRight
                    size={16}
                    color={colors.primary}
                    strokeWidth={2.2}
                  />
                  <Text style={styles.secondaryBtnText}>חזרה לעיצוב</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>

        {qrImage && !loading ? (
          <View style={styles.offscreenCapture} pointerEvents="none">
            <QrPreviewComposite
              ref={previewCaptureRef}
              {...previewProps}
              previewSize={480}
              forExport
            />
          </View>
        ) : null}
      </View>
    </ScreenWithAccessibility>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    pageInner: { flex: 1, overflow: "visible" },
    content: { padding: 16, paddingBottom: 32, gap: 14 },
    stepIndicator: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      marginBottom: 4,
    },
    stepItem: { alignItems: "center", gap: 6, minWidth: 64 },
    stepBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.inputBg,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    stepBadgeActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepBadgeDone: {
      backgroundColor: `${colors.primary}22`,
      borderColor: colors.primary,
    },
    stepBadgeText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.subText,
    },
    stepBadgeTextActive: { color: colors.white },
    stepLabel: { fontSize: 12, fontWeight: "600", color: colors.subText },
    stepLabelActive: { color: colors.primary, fontWeight: "800" },
    stepLine: {
      flex: 1,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: 6,
      maxWidth: 40,
    },
    stepLineDone: { backgroundColor: colors.primary },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
      gap: 14,
    },
    cardHeader: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
    },
    stepTag: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    stepTagText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "800",
    },
    cardTitle: {
      flex: 1,
      fontSize: 19,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
    },
    contentBox: {
      padding: 14,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    previewInline: {
      alignItems: "center",
      paddingVertical: 4,
    },
    exportBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
      marginTop: 4,
    },
    exportBtnText: {
      color: colors.white,
      fontWeight: "800",
      fontSize: 16,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    primaryBtnHalf: { flex: 1 },
    primaryBtnText: { color: colors.white, fontWeight: "800", fontSize: 16 },
    secondaryBtn: {
      paddingVertical: 12,
      alignItems: "center",
      flex: 1,
    },
    secondaryBtnText: {
      color: colors.primary,
      fontWeight: "700",
      fontSize: 14,
    },
    dualActions: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    btnRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.inputBg,
      fontSize: 15,
      color: colors.text,
    },
    saveBox: { gap: 10, marginTop: 4 },
    saveLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      textAlign: "right",
    },
    saveBtn: {
      backgroundColor: colors.primaryDark,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: "center",
    },
    saveBtnText: { color: colors.white, fontWeight: "800", fontSize: 15 },
    saveMsg: { textAlign: "center", fontSize: 14 },
    saveMsgOk: { color: colors.primary, fontWeight: "700" },
    saveMsgErr: { color: colors.error },
    btnDisabled: { opacity: 0.6 },
    offscreenCapture: {
      position: "absolute",
      left: -6000,
      top: 0,
      width: 480,
      height: 480,
      opacity: 0.01,
    },
  });
