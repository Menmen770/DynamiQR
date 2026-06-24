import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAccessibility } from "../context/AccessibilityContext";
import ScreenWithAccessibility from "../components/ScreenWithAccessibility";
import StackBackHeader from "../components/StackBackHeader";

export default function PrivacyScreen() {
  const { colors } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenWithAccessibility>
      <StackBackHeader title="פרטיות ותנאים" colors={colors} />
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטיות</Text>
          <Text style={styles.text}>
            אנו אוספים מידע בסיסי לצורך הרשמה והתחברות (אימייל, שם). קודי QR
            שאתה יוצר נשמרים בחשבונך רק אם בחרת לשמור אותם. לא נמכור את
            המידע שלך לצד שלישי.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>שימוש בשירות</Text>
          <Text style={styles.text}>
            השירות מיועד ליצירת קודי QR לגיטימיים בלבד. אסור להשתמש בו לתוכן
            מטעה, זדוני או המפר זכויות יוצרים. אנו שומרים לעצמנו את הזכות
            לחסום חשבונות שמפרים תנאים אלה.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>אחריות</Text>
          <Text style={styles.text}>
            השירות ניתן «כמות שהוא». איננו אחראים לנזקים עקיפים הנובעים
            משימוש בקודי QR שנוצרו. מומלץ לבדוק כל QR לפני הדפסה או הפצה.
          </Text>
        </View>

        <Text style={styles.updated}>עודכן: 2026</Text>
      </ScrollView>
    </ScreenWithAccessibility>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    content: { padding: 20, paddingBottom: 40 },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
      marginBottom: 20,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      textAlign: "right",
      marginBottom: 8,
    },
    text: {
      fontSize: 14,
      color: colors.subText,
      textAlign: "right",
      lineHeight: 22,
    },
    updated: {
      fontSize: 12,
      color: colors.subText,
      textAlign: "center",
      marginTop: 16,
    },
  });
