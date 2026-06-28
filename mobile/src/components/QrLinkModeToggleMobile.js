import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconHelpCircle } from "@tabler/icons-react-native";
import { useAccessibility } from "../context/AccessibilityContext";
import { row, rtlView } from "../utils/layout";
import QrStaticDynamicHelpModal from "./QrStaticDynamicHelpModal";

const OPTIONS = [
  { id: "static", label: "סטטי" },
  { id: "dynamic", label: "דינמי" },
];

/**
 * בורר סטטי / דינמי — פס טורקיז עם מקטע פעיל לבן (מקביל לאתר).
 */
export default function QrLinkModeToggleMobile({
  linkMode = "static",
  onChange,
  compact,
}) {
  const { colors, darkMode } = useAccessibility();
  const styles = useMemo(
    () => createStyles(colors, darkMode, compact),
    [colors, darkMode, compact],
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const selected = linkMode === "dynamic" ? "dynamic" : "static";

  const handleSelect = (id) => {
    if (id === selected) return;
    onChange?.(id);
  };

  return (
    <View style={[styles.wrap, rtlView]}>
      <View style={styles.headerRow}>
        <Text style={styles.caption}>סוג קישור</Text>
        <Pressable
          onPress={() => setHelpOpen(true)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="מה ההבדל בין סטטי לדינמי"
          style={({ pressed }) => [styles.helpBtn, pressed && styles.helpBtnPressed]}
        >
          <IconHelpCircle size={18} color={colors.primary} strokeWidth={1.85} />
        </Pressable>
      </View>

      <View style={styles.track}>
        {OPTIONS.map((opt) => {
          const active = opt.id === selected;
          return (
            <Pressable
              key={opt.id}
              onPress={() => handleSelect(opt.id)}
              style={({ pressed }) => [
                styles.segment,
                active && styles.segmentActive,
                pressed && !active && styles.segmentPressed,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, checked: active }}
              accessibilityLabel={opt.label}
            >
              <Text style={[styles.segmentLabel, active && styles.segmentLabelOn]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <QrStaticDynamicHelpModal
        visible={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </View>
  );
}

const createStyles = (colors, darkMode, compact) =>
  StyleSheet.create({
    wrap: {
      marginTop: compact ? 2 : 6,
      marginBottom: compact ? 10 : 14,
    },
    headerRow: {
      ...row,
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    caption: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      textAlign: "right",
      flex: 1,
    },
    helpBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: darkMode
        ? "rgba(10, 147, 150, 0.15)"
        : "rgba(10, 147, 150, 0.08)",
      borderWidth: 1,
      borderColor: darkMode
        ? "rgba(10, 147, 150, 0.35)"
        : "rgba(10, 147, 150, 0.22)",
    },
    helpBtnPressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
    track: {
      flexDirection: "row",
      minHeight: 44,
      padding: 4,
      borderRadius: 22,
      backgroundColor: darkMode
        ? "rgba(10, 147, 150, 0.18)"
        : "rgba(10, 147, 150, 0.1)",
      borderWidth: 1,
      borderColor: darkMode
        ? "rgba(10, 147, 150, 0.38)"
        : "rgba(10, 147, 150, 0.22)",
      gap: 4,
    },
    segment: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 36,
      borderRadius: 18,
    },
    segmentActive: {
      backgroundColor: colors.card,
      shadowColor: "#0a9396",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    segmentPressed: {
      opacity: 0.72,
    },
    segmentLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "rgba(243, 244, 246, 0.55)" : "rgba(71, 85, 105, 0.75)",
    },
    segmentLabelOn: {
      color: colors.primary,
      fontWeight: "800",
    },
  });
