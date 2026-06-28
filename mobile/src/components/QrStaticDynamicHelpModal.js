import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAccessibility } from "../context/AccessibilityContext";

export default function QrStaticDynamicHelpModal({ visible, onClose }) {
  const { colors } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>סטטי ודינמי — מה ההבדל?</Text>

          <Text style={styles.body}>
            <Text style={styles.strong}>QR סטטי: </Text>
            הקישור או התוכן נשמרים ישירות בתוך קוד ה‑QR. כל סריקה פותחת את אותה
            כתובת. כדי לשנות יעד צריך לייצר QR חדש.
          </Text>

          <Text style={styles.body}>
            <Text style={styles.strong}>QR דינמי: </Text>
            ב‑QR נשמר קישור קצר קבוע דרך השרת; הסורק מועבר ליעד הנוכחי שאפשר
            לעדכן מהחשבון בלי להדפיס מחדש, כולל סטטיסטיקות סריקות.
          </Text>

          <Text style={styles.muted}>
            תוכן שלא אמור להשתנות — סטטי. קמפיינים, קישורים משתנים או צורך
            במעקב — דינמי.
          </Text>

          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.btnText}>הבנתי</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 24,
    },
    sheet: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
      textAlign: "right",
      color: colors.text,
      marginBottom: 14,
    },
    body: {
      fontSize: 14,
      color: colors.text,
      textAlign: "right",
      lineHeight: 22,
      marginBottom: 12,
    },
    strong: {
      fontWeight: "700",
      color: colors.text,
    },
    muted: {
      fontSize: 13,
      color: colors.subText,
      textAlign: "right",
      lineHeight: 20,
      marginBottom: 18,
    },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    btnText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.white,
    },
  });
