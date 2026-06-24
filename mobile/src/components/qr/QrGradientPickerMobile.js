import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { IconEdit } from "@tabler/icons-react-native";
import {
  createLinearGradient,
  getGradientAngleDegrees,
  getGradientColors,
  gradientToLinearFill,
  gradientsEqual,
} from "../../utils/qrGradientsMobile";

const ANGLE_OPTIONS = [0, 45, 90, 135, 180, 225, 270, 315];

function GradientSwatch({ gradient, selected, onPress, colors, size = 48 }) {
  const fill = gradientToLinearFill(gradient, "#cccccc");
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        swatchStyles.swatchOuter,
        {
          width: size,
          height: size,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 3 : 2,
        },
      ]}
    >
      <LinearGradient
        colors={fill.colors}
        locations={fill.locations}
        start={fill.start}
        end={fill.end}
        style={swatchStyles.swatchInner}
      />
    </TouchableOpacity>
  );
}

export default function QrGradientPickerMobile({
  colors,
  presets,
  gradient,
  onChange,
  fallbackColors = ["#0a9396", "#005f73"],
  angleLabel = "זווית גרדיאנט",
  colorPalette = [],
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const [startColor, endColor] = getGradientColors(gradient, fallbackColors);
  const angle = getGradientAngleDegrees(gradient, 135);
  const isCustom = !presets.some((p) => gradientsEqual(p.gradient, gradient));
  const previewFill = gradientToLinearFill(gradient, fallbackColors[0]);

  return (
    <View style={swatchStyles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={swatchStyles.swatchRow}
      >
        {presets.map((preset) => (
          <GradientSwatch
            key={preset.id}
            gradient={preset.gradient}
            selected={gradientsEqual(preset.gradient, gradient)}
            onPress={() => onChange(preset.gradient)}
            colors={colors}
          />
        ))}
        <TouchableOpacity
          onPress={() => setCustomOpen(true)}
          activeOpacity={0.85}
          accessibilityLabel="גרדיאנט מותאם אישית"
          style={[
            swatchStyles.customTrigger,
            {
              borderColor: isCustom ? colors.primary : colors.border,
              borderWidth: isCustom ? 3 : 2,
            },
          ]}
        >
          <LinearGradient
            colors={previewFill.colors}
            locations={previewFill.locations}
            start={previewFill.start}
            end={previewFill.end}
            style={swatchStyles.customTriggerFill}
          >
            <IconEdit size={20} color="#fff" strokeWidth={2} />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <CustomGradientModal
        visible={customOpen}
        onClose={() => setCustomOpen(false)}
        colors={colors}
        startColor={startColor}
        endColor={endColor}
        angle={angle}
        angleLabel={angleLabel}
        colorPalette={colorPalette}
        onApply={(start, end, nextAngle) => {
          onChange(createLinearGradient(nextAngle, [start, end]));
          setCustomOpen(false);
        }}
      />
    </View>
  );
}

function CustomGradientModal({
  visible,
  onClose,
  colors,
  startColor,
  endColor,
  angle,
  angleLabel,
  colorPalette,
  onApply,
}) {
  const [start, setStart] = useState(startColor);
  const [end, setEnd] = useState(endColor);
  const [nextAngle, setNextAngle] = useState(angle);
  const styles = useMemo(() => createModalStyles(colors), [colors]);

  React.useEffect(() => {
    if (!visible) return;
    setStart(startColor);
    setEnd(endColor);
    setNextAngle(angle);
  }, [visible, startColor, endColor, angle]);

  const previewGradient = createLinearGradient(nextAngle, [start, end]);
  const previewFill = gradientToLinearFill(previewGradient, start);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>גרדיאנט מותאם</Text>

          <LinearGradient
            colors={previewFill.colors}
            locations={previewFill.locations}
            start={previewFill.start}
            end={previewFill.end}
            style={styles.preview}
          />

          <Text style={styles.label}>צבע התחלה</Text>
          <ColorPickRow
            colors={colors}
            value={start}
            palette={colorPalette}
            onChange={setStart}
          />

          <Text style={styles.label}>צבע סיום</Text>
          <ColorPickRow
            colors={colors}
            value={end}
            palette={colorPalette}
            onChange={setEnd}
          />

          <Text style={styles.label}>
            {angleLabel}: {nextAngle}°
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.angleRow}
          >
            {ANGLE_OPTIONS.map((deg) => (
              <TouchableOpacity
                key={deg}
                onPress={() => setNextAngle(deg)}
                style={[
                  styles.angleChip,
                  nextAngle === deg && styles.angleChipOn,
                ]}
              >
                <Text
                  style={[
                    styles.angleChipText,
                    nextAngle === deg && styles.angleChipTextOn,
                  ]}
                >
                  {deg}°
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>ביטול</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => onApply(start, end, nextAngle)}
            >
              <Text style={styles.applyText}>החל</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ColorPickRow({ colors, value, palette, onChange }) {
  const styles = useMemo(() => createModalStyles(colors), [colors]);
  return (
    <View style={styles.colorRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.paletteRow}
      >
        {palette.map((c) => (
          <TouchableOpacity
            key={c.hex}
            onPress={() => onChange(c.hex)}
            style={[
              styles.colorDot,
              { backgroundColor: c.hex },
              value === c.hex && styles.colorDotOn,
            ]}
          />
        ))}
      </ScrollView>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={styles.hexInput}
        autoCapitalize="none"
        maxLength={7}
        textAlign="center"
      />
    </View>
  );
}

const swatchStyles = StyleSheet.create({
  wrap: { marginTop: 4 },
  swatchRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  swatchOuter: {
    borderRadius: 999,
    overflow: "hidden",
  },
  swatchInner: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  customTrigger: {
    width: 48,
    height: 48,
    borderRadius: 999,
    overflow: "hidden",
  },
  customTriggerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

const createModalStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 28,
      maxHeight: "85%",
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
      marginBottom: 14,
    },
    preview: {
      height: 72,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    label: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      textAlign: "right",
      marginBottom: 8,
      marginTop: 4,
    },
    colorRow: { marginBottom: 8, gap: 10 },
    paletteRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
    colorDot: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: "transparent",
    },
    colorDotOn: { borderColor: colors.primary },
    hexInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.inputBg,
    },
    angleRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
    angleChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    angleChipOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    angleChipText: { fontSize: 13, fontWeight: "600", color: colors.text },
    angleChipTextOn: { color: colors.white },
    actions: {
      flexDirection: "row-reverse",
      gap: 10,
      marginTop: 18,
    },
    applyBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    applyText: { color: colors.white, fontWeight: "700", fontSize: 16 },
    cancelBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelText: { color: colors.subText, fontWeight: "600", fontSize: 16 },
  });
