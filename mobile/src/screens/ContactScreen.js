import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAccessibility } from "../context/AccessibilityContext";
import ScreenWithAccessibility from "../components/ScreenWithAccessibility";
import StackBackHeader from "../components/StackBackHeader";

export default function ContactScreen() {
  const { colors } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenWithAccessibility>
      <StackBackHeader title="צור קשר" colors={colors} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.paragraph}>
          יש לך שאלה, הצעה או בעיה טכנית? נשמח לעזור.
        </Text>
        <View style={styles.card}>
          <Text style={styles.label}>אימייל</Text>
          <Text style={styles.value}>support@qrmaster.app</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>שעות מענה</Text>
          <Text style={styles.value}>ימים א׳–ה׳, 09:00–18:00</Text>
        </View>
        <Text style={styles.note}>
          נחזור אליך בהקדם האפשרי. לפניות דחופות ציין את כתובת האימייל
          שאיתה נרשמת.
        </Text>
      </ScrollView>
    </ScreenWithAccessibility>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    content: { padding: 20, paddingBottom: 40 },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
      marginBottom: 12,
    },
    paragraph: {
      fontSize: 15,
      color: colors.subText,
      textAlign: "right",
      lineHeight: 24,
      marginBottom: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.subText,
      textAlign: "right",
      marginBottom: 4,
    },
    value: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      textAlign: "right",
    },
    note: {
      fontSize: 13,
      color: colors.subText,
      textAlign: "right",
      lineHeight: 22,
      marginTop: 8,
    },
  });
