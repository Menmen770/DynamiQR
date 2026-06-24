import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconQrcode, IconScan } from "@tabler/icons-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAccessibility } from "../context/AccessibilityContext";
import ScreenWithAccessibility from "../components/ScreenWithAccessibility";

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { colors } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleScanQr = () => {
    navigation.navigate("QrScanner");
  };

  const handleCreateQr = () => {
    navigation.navigate("QrGenerator");
  };

  return (
    <ScreenWithAccessibility>
    <View style={styles.container}>
      <Text style={styles.greeting}>מה תרצה לעשות?</Text>

      <View style={styles.cardsSection}>
        <TouchableOpacity
          style={styles.card}
          onPress={handleScanQr}
          activeOpacity={0.85}
        >
          <View style={styles.cardIcon}>
            <IconScan size={28} color={colors.primary} strokeWidth={1.75} />
          </View>
          <Text style={styles.cardTitle}>סרוק QR קיים</Text>
          <Text style={styles.cardSubtitle}>
            סרוק קוד QR כדי לפתוח את התוכן בדפדפן
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cardSecondary]}
          onPress={handleCreateQr}
          activeOpacity={0.85}
        >
          <View style={[styles.cardIcon, styles.cardIconSecondary]}>
            <IconQrcode size={28} color={colors.text} strokeWidth={1.75} />
          </View>
          <Text style={styles.cardTitle}>צור QR חדש</Text>
          <Text style={styles.cardSubtitle}>
            עיצוב אישי, הורדה ושמירה לחשבון
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScreenWithAccessibility>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    textAlign: "right",
    marginBottom: 20,
  },
  cardsSection: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: `${colors.primary}26`,
  },
  cardSecondary: {
    borderColor: `${colors.border}`,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${colors.primary}1F`,    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  cardIconSecondary: {
    backgroundColor: colors.toggleBg,
  },  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
    textAlign: "right",
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.subText,
    lineHeight: 22,
    textAlign: "right",
  },
});
