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
import { IconEdit } from "@tabler/icons-react-native";
import QrGradientPickerMobile from "./QrGradientPickerMobile";
import {
  BG_GRADIENT_PRESETS,
  QR_GRADIENT_PRESETS,
} from "../../utils/qrGradientsMobile";
import {
  PRESET_BG_COLORS,
  PRESET_QR_COLORS,
} from "../../utils/qrConstantsMobile";

function ModeToggle({ options, value, onChange, colors }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.modeRow}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={[styles.modeChip, active && styles.modeChipOn]}
          >
            <Text style={[styles.modeText, active && styles.modeTextOn]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ColorSwatch({ hex, selected, onPress, colors, name }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={name ? `צבע: ${name}` : undefined}
      style={[
        styles.colorSwatch,
        { backgroundColor: hex },
        selected && styles.colorSwatchOn,
      ]}
    />
  );
}

function CustomColorButton({ value, onChange, colors, palette }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
        style={[styles.colorSwatch, styles.customSwatch, { backgroundColor: value }]}
        accessibilityLabel="צבע מותאם אישית"
      >
        <IconEdit size={18} color="#fff" strokeWidth={2} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>צבע מותאם</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.paletteRow}
            >
              {palette.map((c) => (
                <ColorSwatch
                  key={c.hex}
                  hex={c.hex}
                  name={c.name}
                  selected={draft === c.hex}
                  onPress={() => setDraft(c.hex)}
                  colors={colors}
                />
              ))}
            </ScrollView>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              style={styles.hexInput}
              autoCapitalize="none"
              maxLength={7}
              textAlign="center"
              placeholder="#000000"
              placeholderTextColor={colors.subText}
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              <Text style={styles.applyText}>החל</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default function QrStyleColorTabMobile({
  colors,
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
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>צבע ה-QR</Text>
        <ModeToggle
          colors={colors}
          value={qrColorMode}
          onChange={setQrColorMode}
          options={[
            { id: "solid", label: "צבע אחיד" },
            { id: "gradient", label: "גרדיאנט" },
          ]}
        />

        {qrColorMode === "solid" ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.paletteRow}
          >
            {PRESET_QR_COLORS.map((c) => (
              <ColorSwatch
                key={c.hex}
                hex={c.hex}
                name={c.name}
                selected={fgColor === c.hex}
                onPress={() => setFgColor(c.hex)}
                colors={colors}
              />
            ))}
            <CustomColorButton
              value={fgColor}
              onChange={setFgColor}
              colors={colors}
              palette={PRESET_QR_COLORS}
            />
          </ScrollView>
        ) : (
          <QrGradientPickerMobile
            colors={colors}
            presets={QR_GRADIENT_PRESETS}
            gradient={dotsGradient}
            onChange={setDotsGradient}
            fallbackColors={["#0a9396", "#005f73"]}
            angleLabel="זווית גרדיאנט"
            colorPalette={PRESET_QR_COLORS}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>רקע</Text>
        <ModeToggle
          colors={colors}
          value={bgColorMode}
          onChange={setBgColorMode}
          options={[
            { id: "none", label: "ללא רקע" },
            { id: "solid", label: "צבע אחיד" },
            { id: "gradient", label: "גרדיאנט" },
          ]}
        />

        {bgColorMode === "solid" ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.paletteRow}
          >
            {PRESET_BG_COLORS.map((c) => (
              <ColorSwatch
                key={c.hex}
                hex={c.hex}
                name={c.name}
                selected={bgColor === c.hex}
                onPress={() => setBgColor(c.hex)}
                colors={colors}
              />
            ))}
            <CustomColorButton
              value={bgColor}
              onChange={setBgColor}
              colors={colors}
              palette={PRESET_BG_COLORS}
            />
          </ScrollView>
        ) : null}

        {bgColorMode === "gradient" ? (
          <QrGradientPickerMobile
            colors={colors}
            presets={BG_GRADIENT_PRESETS}
            gradient={bgGradient}
            onChange={setBgGradient}
            fallbackColors={["#fff7ed", "#fed7aa"]}
            angleLabel="כיוון הרקע"
            colorPalette={PRESET_BG_COLORS}
          />
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    wrap: { gap: 20 },
    section: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
    },
    modeRow: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8,
    },
    modeChip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeChipOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    modeText: { fontSize: 13, fontWeight: "700", color: colors.text },
    modeTextOn: { color: colors.white },
    paletteRow: {
      flexDirection: "row",
      gap: 10,
      paddingVertical: 4,
    },
    colorSwatch: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: "transparent",
    },
    colorSwatchOn: {
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 4,
    },
    customSwatch: {
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.border,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalSheet: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      gap: 12,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
    },
    hexInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.inputBg,
    },
    applyBtn: {
      marginTop: 4,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    applyText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  });
