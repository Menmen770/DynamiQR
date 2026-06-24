import React, { useMemo } from "react";
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
import * as ImageManipulator from "expo-image-manipulator";
import QrStyleColorTabMobile from "./QrStyleColorTabMobile";
import SvgThumbButton from "../SvgThumbButton";
import ImageThumbButton from "../ImageThumbButton";
import {
  BODY_SHAPES,
  CORNER_SHAPES,
  ERROR_CORRECTION_LEVELS,
  STYLE_TABS,
} from "../../utils/qrConstantsMobile";
import {
  BODY_SHAPE_MODULES,
  CORNER_SHAPE_THUMBS,
} from "../../utils/qrShapeAssetsMobile";
import { STICKER_OPTIONS } from "../../utils/stickerAssetsMobile";
import { PRESET_BRAND_MODULES } from "../../utils/presetLogosMobile";

export default function QrStylePanelMobile({
  colors,
  activeTab,
  onTabChange,
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
  selectedPresetId,
  setSelectedPresetId,
  setError,
  errorCorrectionLevel,
  setErrorCorrectionLevel,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

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
      quality: 1,
    });
    if (res.canceled || !res.assets?.[0]?.uri) return;
    setLogoInputMode("gallery");
    const a = res.assets[0];
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        a.uri,
        [{ resize: { width: 400, height: 400 } }],
        {
          compress: 0.75,
          format: ImageManipulator.SaveFormat.PNG,
          base64: true,
        },
      );
      if (!manipulated.base64) throw new Error("לא ניתן לעבד את התמונה");
      setLogoInsetScale(1);
      setLogoUrl(`data:image/png;base64,${manipulated.base64}`);
      setSelectedPresetId(null);
      setError("");
    } catch (err) {
      Alert.alert("שגיאה", err.message || "לא ניתן לטעון את התמונה");
    }
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {STYLE_TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => onTabChange(t.id)}
            style={[styles.tabPill, activeTab === t.id && styles.tabPillActive]}
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

      {activeTab === "color" ? (
        <QrStyleColorTabMobile
          colors={colors}
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
        />
      ) : null}

      {activeTab === "shape" ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>סוג גוף</Text>
          <View style={styles.thumbGrid}>
            {BODY_SHAPES.map((s, idx) => (
              <View key={s.id} style={styles.thumbCell}>
                <SvgThumbButton
                  assetModule={BODY_SHAPE_MODULES[idx]}
                  size={52}
                  selected={dotsType === s.id}
                  onPress={() => setDotsType(s.id)}
                  borderColor={colors.border}
                  activeBorderColor={colors.primary}
                />
                <Text
                  style={[
                    styles.thumbLabel,
                    dotsType === s.id && styles.thumbLabelOn,
                  ]}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.mt]}>פינות</Text>
          <View style={styles.thumbGrid}>
            {CORNER_SHAPES.map((s, idx) => (
              <View key={s.id} style={styles.thumbCell}>
                <ImageThumbButton
                  imageModule={CORNER_SHAPE_THUMBS[idx]}
                  size={52}
                  selected={cornersType === s.id}
                  onPress={() => setCornersType(s.id)}
                  borderColor={colors.border}
                  activeBorderColor={colors.primary}
                />
                <Text
                  style={[
                    styles.thumbLabel,
                    cornersType === s.id && styles.thumbLabelOn,
                  ]}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {activeTab === "logo" ? (
        <View style={styles.panel}>
          <Text style={styles.hint}>
            בחרו לוגו מוכן, מהגלריה או מקישור. הלוגו יופיע במרכז ה-QR בתצוגה
            המקדימה.
          </Text>

          <Text style={styles.sectionTitle}>צורת לוגו במרכז</Text>
          <View style={styles.chipRow}>
            {[
              { id: "square", label: "חור מרובע" },
              { id: "circle", label: "חור עגול" },
              { id: "overlay", label: "ללא חור" },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => setLogoShape(m.id)}
                style={[styles.chip, logoShape === m.id && styles.chipOn]}
              >
                <Text style={[styles.chipText, logoShape === m.id && styles.chipTextOn]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.mt]}>מקור לוגו</Text>
          <View style={styles.chipRow}>
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
                style={[styles.chip, logoInputMode === m.id && styles.chipOn]}
              >
                <Text
                  style={[
                    styles.chipText,
                    logoInputMode === m.id && styles.chipTextOn,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {logoInputMode === "preset" ? (
            <View style={styles.presetGrid}>
              {PRESET_BRAND_MODULES.map((p) => (
                <SvgThumbButton
                  key={p.id}
                  assetModule={p.module}
                  size={44}
                  selected={selectedPresetId === p.id && Boolean(logoUrl)}
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
          ) : null}

          {logoInputMode === "gallery" ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={pickLogoFromGallery}>
              <Text style={styles.primaryBtnText}>בחר תמונה מהמכשיר</Text>
            </TouchableOpacity>
          ) : null}

          {logoInputMode === "url" ? (
            <TextInput
              value={logoUrl?.startsWith("data:") ? "" : logoUrl}
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
              placeholderTextColor={colors.subText}
            />
          ) : null}

          {logoUrl ? (
            <TouchableOpacity
              onPress={() => {
                setSelectedPresetId(null);
                clearLogo();
              }}
              style={styles.linkBtn}
            >
              <Text style={styles.linkBtnText}>הסר לוגו</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {activeTab === "sticker" ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>מסגרת סטיקר</Text>
          <View style={styles.stickerGrid}>
            {STICKER_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setStickerType(s.id)}
                style={[
                  styles.stickerCell,
                  stickerType === s.id && styles.stickerCellOn,
                ]}
                activeOpacity={0.85}
              >
                {s.id === "none" ? (
                  <Text style={styles.stickerNoneText}>ללא</Text>
                ) : (
                  <Image
                    source={s.thumb}
                    style={styles.stickerThumb}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {activeTab === "advanced" ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>רמת תיקון שגיאות</Text>
          <View style={styles.ecList}>
            {ERROR_CORRECTION_LEVELS.map((lvl) => (
              <TouchableOpacity
                key={lvl.id}
                onPress={() => setErrorCorrectionLevel(lvl.id)}
                style={[
                  styles.ecCard,
                  errorCorrectionLevel === lvl.id && styles.ecCardOn,
                ]}
              >
                <Text
                  style={[
                    styles.ecLabel,
                    errorCorrectionLevel === lvl.id && styles.ecLabelOn,
                  ]}
                >
                  {lvl.label}
                </Text>
                <Text style={styles.ecDesc}>{lvl.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    wrap: { gap: 12 },
    tabBar: {
      flexDirection: "row-reverse",
      gap: 8,
      paddingVertical: 4,
    },
    tabPill: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabPillText: { fontSize: 14, fontWeight: "700", color: colors.subText },
    tabPillTextActive: { color: colors.white },
    panel: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
    },
    hint: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.subText,
      textAlign: "right",
    },
    mt: { marginTop: 8 },
    thumbGrid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "center",
    },
    thumbCell: { alignItems: "center", width: "28%", gap: 6 },
    thumbLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.subText,
      textAlign: "center",
    },
    thumbLabelOn: { color: colors.primary, fontWeight: "800" },
    chipRow: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: { fontSize: 13, fontWeight: "700", color: colors.text },
    chipTextOn: { color: colors.white },
    presetGrid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 10,
      justifyContent: "center",
      marginTop: 4,
    },
    primaryBtn: {
      marginTop: 4,
      paddingVertical: 13,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 15 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.card,
      fontSize: 15,
      color: colors.text,
    },
    linkBtn: { alignSelf: "flex-start", marginTop: 4 },
    linkBtnText: { color: colors.primary, fontWeight: "700", fontSize: 14 },
    stickerGrid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 10,
      justifyContent: "center",
    },
    stickerCell: {
      width: "30%",
      aspectRatio: 1,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      padding: 6,
    },
    stickerCellOn: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
    stickerThumb: { width: "100%", height: "100%" },
    stickerNoneText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.subText,
    },
    ecList: { gap: 8 },
    ecCard: {
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    ecCardOn: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}12`,
    },
    ecLabel: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
    },
    ecLabelOn: { color: colors.primary },
    ecDesc: {
      fontSize: 13,
      color: colors.subText,
      textAlign: "right",
      marginTop: 2,
    },
  });
