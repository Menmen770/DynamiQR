import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IconArrowRight } from "@tabler/icons-react-native";
import { useAccessibility } from "../context/AccessibilityContext";
import ThemeToggle from "./ThemeToggle";
import { row, textStart } from "../utils/layout";

export default function StackBackHeader({ title, colors, showThemeToggle = true }) {
  const navigation = useNavigation();
  const { darkMode, setDarkMode } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
        accessibilityLabel="חזרה"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <IconArrowRight size={20} color={colors.primary} strokeWidth={2.2} />
        <Text style={styles.backText}>חזרה</Text>
      </TouchableOpacity>
      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
      {showThemeToggle ? (
        <ThemeToggle value={darkMode} onValueChange={setDarkMode} />
      ) : (
        <View style={styles.toggleSpacer} />
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    bar: {
      ...row,
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    backBtn: {
      ...row,
      alignItems: "center",
      gap: 4,
      paddingVertical: 4,
    },
    backText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
      ...textStart,
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
      ...textStart,
      marginStart: 12,
    },
    toggleSpacer: {
      width: 58,
    },
  });
