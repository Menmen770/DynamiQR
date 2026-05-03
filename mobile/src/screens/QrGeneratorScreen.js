import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useQrGeneratorMobile } from "../hooks/useQrGeneratorMobile";
import { useAccessibility } from "../context/AccessibilityContext";
import AuthFooter from "../components/AuthFooter";
import BackToTopButton, { SCROLL_THRESHOLD } from "../components/BackToTopButton";
import ScreenWithAccessibility from "../components/ScreenWithAccessibility";
import QrPreviewComposite from "../components/QrPreviewComposite";
import SvgThumbButton from "../components/SvgThumbButton";
import {
  BG_EFFECT_GRADIENTS,
  BODY_SHAPES,
  CORNER_SHAPES,
  PRESET_BG_COLORS,
  PRESET_QR_COLORS,
} from "../utils/qrConstantsMobile";
import {
  BODY_SHAPE_MODULES,
  CORNER_SHAPE_MODULES,
} from "../utils/qrShapeAssetsMobile";
import { STICKER_OPTIONS } from "../utils/stickerAssetsMobile";
import { PRESET_BRAND_MODULES } from "../utils/presetLogosMobile";

const TABS = [
  { id: "color", label: "צבע" },
  { id: "shape", label: "צורה" },
  { id: "logo", label: "לוגו" },
  { id: "sticker", label: "סטיקר" },
];

export default function QrGeneratorScreen() {
  const { colors } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeTab, setActiveTab] = useState("color");
  const [selectedPresetId, setSelectedPresetId] = useState(null);

  const qr = useQrGeneratorMobile();
  const {
    url,
    setUrl,
    fgColor,
    setFgColor,
    bgColor,
    setBgColor,
    bgColorMode,
    setBgColorMode,
    bgEffect,
    setBgEffect,
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
    qrImage,
    loading,
    error,
    setError,
  } = qr;

  const handleScroll = (e) => {
    const y = e?.nativeEvent?.contentOffset?.y ?? 0;
    setShowBackToTop(y > SCROLL_THRESHOLD);
  };

  const pickLogoFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("הרשאה נדרשת", "אפשר גישה לתמונות בהגדרות המכשיר.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      base64: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    setLogoInputMode("gallery");
    const a = res.assets[0];
    const mime = a.mimeType || "image/jpeg";
    setLogoInsetScale(1);
    setLogoUrl(`data:${mime};base64,${a.base64}`);
    setSelectedPresetId(null);
    setError("");
  };

  const handleClearLogo = () => {
    setSelectedPresetId(null);
    clearLogo();
  };

  return (
    <ScreenWithAccessibility>
      <View style={styles.pageInner}>
        <ScrollView
          ref={scrollRef}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>מחולל QR בעיצוב אישי</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>תוכן</Text>
            </View>
            <Text style={styles.label}>כתובת (URL)</Text>
            <TextInput
              value={url}
              onChangeText={(t) => {
                setUrl(t);
                setError("");
              }}
              placeholder="https://example.com"
              autoCapitalize="none"
              keyboardType="url"
              style={styles.input}
              textAlign="right"
            />
          </View>

          <View style={styles.card}>
            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>התאם את העיצוב</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabBar}
            >
              {TABS.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setActiveTab(t.id)}
                  style={[
                    styles.tabPill,
                    activeTab === t.id && styles.tabPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabPillText,
                      activeTab === t.id && styles.tabPillTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {activeTab === "color" && (
              <View style={styles.tabBody}>
                <Text style={styles.sectionLabel}>צבע נקודות ה-QR</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.paletteRow}
                >
                  {PRESET_QR_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c.hex}
                      onPress={() => setFgColor(c.hex)}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c.hex },
                        fgColor === c.hex && styles.colorDotSelected,
                      ]}
                      accessibilityLabel={c.name}
                    />
                  ))}
                </ScrollView>

                <Text style={[styles.sectionLabel, styles.mt]}>רקע</Text>
                <View style={styles.bgModeRow}>
                  {[
                    { id: "none", label: "ללא" },
                    { id: "solid", label: "צבע אחיד" },
                    { id: "effect", label: "אפקט" },
                  ].map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => setBgColorMode(m.id)}
                      style={[
                        styles.modeChip,
                        bgColorMode === m.id && styles.modeChipOn,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeChipText,
                          bgColorMode === m.id && styles.modeChipTextOn,
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {bgColorMode === "solid" && (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.paletteRow}
                    >
                      {PRESET_BG_COLORS.map((c) => (
                        <TouchableOpacity
                          key={c.hex}
                          onPress={() => setBgColor(c.hex)}
                          style={[
                            styles.colorDot,
                            { backgroundColor: c.hex },
                            bgColor === c.hex && styles.colorDotSelected,
                          ]}
                        />
                      ))}
                    </ScrollView>
                  </>
                )}

                {bgColorMode === "effect" && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.paletteRow}
                  >
                    {BG_EFFECT_GRADIENTS.filter((e) => e.id !== "none").map(
                      (ef) => (
                        <TouchableOpacity
                          key={ef.id}
                          onPress={() => setBgEffect(ef.id)}
                          style={[
                            styles.effectDot,
                            bgEffect === ef.id && styles.colorDotSelected,
                          ]}
                        >
                          <LinearGradient
                            colors={ef.colors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.effectGradientFill}
                          />
                        </TouchableOpacity>
                      ),
                    )}
                  </ScrollView>
                )}
              </View>
            )}

            {activeTab === "shape" && (
              <View style={styles.tabBody}>
                <Text style={styles.sectionLabel}>סוג גוף</Text>
                <View style={styles.shapeRow}>
                  {BODY_SHAPES.map((s, idx) => (
                    <SvgThumbButton
                      key={s.id}
                      assetModule={BODY_SHAPE_MODULES[idx]}
                      size={44}
                      selected={dotsType === s.id}
                      onPress={() => setDotsType(s.id)}
                      borderColor={colors.border}
                      activeBorderColor={colors.primary}
                    />
                  ))}
                </View>
                <Text style={[styles.sectionLabel, styles.mt]}>פינות</Text>
                <View style={styles.shapeRow}>
                  {CORNER_SHAPES.map((s, idx) => (
                    <SvgThumbButton
                      key={s.id}
                      assetModule={CORNER_SHAPE_MODULES[idx]}
                      size={44}
                      selected={cornersType === s.id}
                      onPress={() => setCornersType(s.id)}
                      borderColor={colors.border}
                      activeBorderColor={colors.primary}
                    />
                  ))}
                </View>
              </View>
            )}

            {activeTab === "logo" && (
              <View style={styles.tabBody}>
                <Text style={styles.sectionLabel}>צורת לוגו במרכז</Text>
                <View style={styles.bgModeRow}>
                  {[
                    { id: "square", label: "חור מרובע" },
                    { id: "circle", label: "חור עגול" },
                    { id: "overlay", label: "ללא חור" },
                  ].map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => setLogoShape(m.id)}
                      style={[
                        styles.modeChip,
                        logoShape === m.id && styles.modeChipOn,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeChipText,
                          logoShape === m.id && styles.modeChipTextOn,
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.bgModeRow}>
                  {[
                    { id: "preset", label: "מוכנים" },
                    { id: "gallery", label: "גלריה" },
                    { id: "url", label: "קישור" },
                  ].map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => {
                        clearLogo();
                        setSelectedPresetId(null);
                        setLogoInputMode(m.id);
                      }}
                      style={[
                        styles.modeChip,
                        logoInputMode === m.id && styles.modeChipOn,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeChipText,
                          logoInputMode === m.id && styles.modeChipTextOn,
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {logoInputMode === "preset" && (
                  <View style={styles.presetGrid}>
                    {PRESET_BRAND_MODULES.map((p) => (
                      <SvgThumbButton
                        key={p.id}
                        assetModule={p.module}
                        size={40}
                        selected={
                          selectedPresetId === p.id && Boolean(logoUrl)
                        }
                        disabled={logoLoadingPreset}
                        onPress={async () => {
                          setSelectedPresetId(p.id);
                          await selectPresetLogo(p);
                        }}
                        borderColor={colors.border}
                        activeBorderColor={colors.primary}
                      />
                    ))}
                  </View>
                )}

                {logoInputMode === "gallery" && (
                  <TouchableOpacity
                    style={styles.galleryBtn}
                    onPress={pickLogoFromGallery}
                  >
                    <Text style={styles.galleryBtnText}>בחר תמונה מהמכשיר</Text>
                  </TouchableOpacity>
                )}

                {logoInputMode === "url" && (
                  <TextInput
                    value={
                      logoUrl?.startsWith("data:") ? "" : logoUrl
                    }
                    onChangeText={(t) => {
                      setLogoInsetScale(1);
                      setLogoUrl(t);
                      setError("");
                    }}
                    placeholder="https://.../logo.png"
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="url"
                    textAlign="right"
                  />
                )}

                {logoUrl ? (
                  <TouchableOpacity
                    onPress={handleClearLogo}
                    style={styles.clearLogo}
                  >
                    <Text style={styles.clearLogoText}>הסר לוגו</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {activeTab === "sticker" && (
              <View style={styles.tabBody}>
                <Text style={styles.sectionLabel}>מסגרת סטיקר</Text>
                <View style={styles.stickerGrid}>
                  {STICKER_OPTIONS.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setStickerType(s.id)}
                      style={[
                        styles.stickerCell,
                        stickerType === s.id && styles.stickerCellOn,
                      ]}
                    >
                      {s.id === "none" ? (
                        <Text style={styles.stickerNoneText}>ללא</Text>
                      ) : (
                        <Image
                          source={s.thumb}
                          style={styles.stickerThumb}
                          resizeMode="cover"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.previewTitle}>תצוגה מקדימה</Text>
            <QrPreviewComposite
              colors={colors}
              qrImage={qrImage}
              loading={loading}
              error={error}
              bgColorMode={bgColorMode}
              bgEffect={bgEffect}
              bgSolidColor={bgColor}
              stickerType={stickerType}
            />
          </View>

          <AuthFooter />
        </ScrollView>
        <BackToTopButton visible={showBackToTop} scrollRef={scrollRef} />
      </View>
    </ScreenWithAccessibility>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    pageInner: {
      flex: 1,
      overflow: "visible",
    },
    content: {
      padding: 16,
      paddingBottom: 120,
      gap: 16,
    },
    hero: {
      alignItems: "center",
      marginBottom: 4,
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    stepRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    stepBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    stepBadgeText: {
      color: colors.white,
      fontWeight: "800",
      fontSize: 14,
    },
    stepTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    label: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      textAlign: "right",
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.inputBg,
      fontSize: 15,
      color: colors.text,
    },
    tabBar: {
      flexDirection: "row-reverse",
      gap: 8,
      marginBottom: 12,
      paddingVertical: 4,
    },
    tabPill: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabPillText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.subText,
    },
    tabPillTextActive: {
      color: colors.white,
    },
    tabBody: {
      marginTop: 4,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      textAlign: "right",
      marginBottom: 10,
    },
    mt: { marginTop: 16 },
    paletteRow: {
      flexDirection: "row-reverse",
      gap: 10,
      paddingVertical: 4,
    },
    colorDot: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    colorDotSelected: {
      borderWidth: 3,
      borderColor: colors.primary,
    },
    effectDot: {
      width: 44,
      height: 44,
      borderRadius: 22,
      overflow: "hidden",
    },
    effectGradientFill: {
      width: "100%",
      height: "100%",
      borderRadius: 22,
    },
    bgModeRow: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    modeChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeChipOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    modeChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
    modeChipTextOn: {
      color: colors.white,
    },
    shapeRow: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    presetGrid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 8,
      justifyContent: "center",
    },
    galleryBtn: {
      marginTop: 8,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    galleryBtnText: {
      color: colors.white,
      fontWeight: "700",
      fontSize: 15,
    },
    clearLogo: {
      marginTop: 10,
      alignSelf: "flex-end",
    },
    clearLogoText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 14,
    },
    stickerGrid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 10,
      justifyContent: "flex-start",
    },
    stickerCell: {
      width: "22%",
      aspectRatio: 1,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      justifyContent: "center",
    },
    stickerCellOn: {
      borderColor: colors.primary,
    },
    stickerThumb: {
      width: "100%",
      height: "100%",
    },
    stickerNoneText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.subText,
    },
    previewTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      textAlign: "right",
      marginBottom: 12,
    },
  });
