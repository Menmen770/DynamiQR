import React, { useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BRAND_LOGO } from "../../constants/brand";
import ThemeToggle from "../ThemeToggle";
import { useAccessibility } from "../../context/AccessibilityContext";

export default function AuthScreenLayout({ colors, title, subtitle, children }) {
  const { darkMode, setDarkMode } = useAccessibility();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const isCompact = windowHeight < 700;
  const isVeryCompact = windowHeight < 620;

  const layout = useMemo(() => {
    const horizontalPad = Math.max(20, Math.min(28, windowWidth * 0.06));
    const logoHeight = isVeryCompact
      ? Math.round(windowHeight * 0.08)
      : isCompact
        ? Math.round(windowHeight * 0.1)
        : Math.min(96, Math.round(windowHeight * 0.12));
    const titleSize = isVeryCompact ? 22 : isCompact ? 24 : 26;
    const blockGap = isVeryCompact ? 10 : isCompact ? 12 : 16;

    return {
      horizontalPad,
      logoHeight,
      logoMaxWidth: Math.min(300, windowWidth - horizontalPad * 2),
      titleSize,
      blockGap,
      isVeryCompact,
    };
  }, [windowHeight, windowWidth, isCompact, isVeryCompact]);

  const styles = useMemo(
    () => createStyles(colors, layout),
    [colors, layout],
  );

  const needsScroll = contentHeight > viewportHeight && viewportHeight > 0;

  const content = (
    <View
      style={styles.block}
      onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
    >
      <View style={styles.hero}>
        <Image source={BRAND_LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.formShell}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <ThemeToggle value={darkMode} onValueChange={setDarkMode} />
      </View>
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
      >
        {needsScroll ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollPad}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            bounces
          >
            {content}
          </ScrollView>
        ) : (
          <View style={styles.centered}>{content}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors, layout) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      alignItems: "flex-end",
      paddingHorizontal: layout.horizontalPad,
      paddingTop: 4,
      paddingBottom: 2,
    },
    page: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollPad: {
      paddingHorizontal: layout.horizontalPad,
      paddingVertical: layout.blockGap,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: layout.horizontalPad,
      paddingVertical: layout.blockGap,
    },
    block: {
      width: "100%",
      maxWidth: 420,
      alignSelf: "center",
      gap: layout.blockGap,
    },
    hero: {
      alignItems: "center",
      gap: layout.blockGap,
    },
    logo: {
      width: layout.logoMaxWidth,
      height: layout.logoHeight,
    },
    header: {
      alignItems: "center",
      width: "100%",
    },
    title: {
      fontSize: layout.titleSize,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
    },
    subtitle: {
      marginTop: 4,
      fontSize: layout.isVeryCompact ? 13 : 14,
      color: colors.subText,
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: 4,
    },
    formShell: {
      width: "100%",
      gap: layout.isVeryCompact ? 10 : 12,
    },
  });
