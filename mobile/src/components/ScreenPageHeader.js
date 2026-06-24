import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * כותרת עמוד ממורכזת — משותף לדפי קודים שמורים, יצירת QR וכו'.
 */
export default function ScreenPageHeader({ title, subtitle, colors }) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrap: {
      width: "100%",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 18,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      letterSpacing: -0.35,
      lineHeight: 30,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 15,
      fontWeight: "500",
      color: colors.subText,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 340,
    },
  });
}
