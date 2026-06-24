import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { IconChevronDown } from "@tabler/icons-react-native";
import { QR_TYPES_MAIN, QR_TYPES_MORE } from "../utils/qrConstantsMobile";

export default function QrTypeSelectorMobile({ colors, qrType, onSelectType }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreHasActive = QR_TYPES_MORE.some((t) => t.value === qrType);

  const renderTypeBtn = (type) => {
    const active = qrType === type.value;
    const IconComponent = type.icon;
    const content = (
      <>
        <IconComponent
          size={16}
          color={active ? "#ffffff" : colors.subText}
          strokeWidth={1.75}
        />
        <Text style={[styles.btnLabel, active && styles.btnLabelActive]}>
          {type.label}
        </Text>
      </>
    );

    if (active) {
      return (
        <TouchableOpacity
          key={type.value}
          onPress={() => onSelectType(type.value)}
          activeOpacity={0.9}
          accessibilityLabel={`סוג QR: ${type.label}`}
          accessibilityState={{ selected: true }}
          style={styles.btnWrap}
        >
          <LinearGradient
            colors={["#0a9396", "#087b7d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btnActive}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={type.value}
        onPress={() => onSelectType(type.value)}
        activeOpacity={0.85}
        accessibilityLabel={`סוג QR: ${type.label}`}
        accessibilityState={{ selected: false }}
        style={styles.btn}
      >
        {content}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>בחרו סוג QR</Text>

      <View style={styles.grid}>{QR_TYPES_MAIN.map(renderTypeBtn)}</View>

      <TouchableOpacity
        style={[styles.moreBtn, moreHasActive && styles.moreBtnActive]}
        onPress={() => setMoreOpen(true)}
        activeOpacity={0.85}
        accessibilityLabel="עוד סוגי QR"
      >
        <IconChevronDown size={16} color={moreHasActive ? colors.primary : colors.subText} />
        <Text style={[styles.moreBtnText, moreHasActive && styles.moreBtnTextActive]}>
          עוד אפשרויות
        </Text>
        {moreHasActive ? (
          <View style={styles.moreBadge}>
            <Text style={styles.moreBadgeText}>
              {QR_TYPES_MORE.find((t) => t.value === qrType)?.label || "נבחר"}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <Modal
        visible={moreOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMoreOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMoreOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>סוגי QR נוספים</Text>
            <View style={styles.moreGrid}>
              {QR_TYPES_MORE.map((type) => {
                const active = qrType === type.value;
                const IconComponent = type.icon;
                return (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => {
                      onSelectType(type.value);
                      setMoreOpen(false);
                    }}
                    style={[styles.moreOption, active && styles.moreOptionActive]}
                  >
                    <IconComponent
                      size={20}
                      color={active ? colors.primary : colors.subText}
                      strokeWidth={1.85}
                    />
                    <Text
                      style={[
                        styles.moreOptionText,
                        active && styles.moreOptionTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      padding: 12,
      borderRadius: 14,
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginBottom: 12,
      gap: 10,
    },
    title: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      textAlign: "right",
    },
    grid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8,
    },
    btnWrap: {
      width: "47%",
      borderRadius: 12,
      overflow: "hidden",
    },
    btn: {
      width: "47%",
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    btnActive: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 12,
      width: "100%",
    },
    btnLabel: {
      flex: 1,
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
      textAlign: "right",
    },
    btnLabelActive: {
      color: "#ffffff",
    },
    moreBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    moreBtnActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
    moreBtnText: {
      flex: 1,
      fontSize: 13,
      fontWeight: "600",
      color: colors.subText,
      textAlign: "right",
    },
    moreBtnTextActive: { color: colors.primary },
    moreBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    moreBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.white,
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheet: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      maxHeight: "80%",
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
      marginBottom: 14,
    },
    moreGrid: { gap: 8 },
    moreOption: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    moreOptionActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}12`,
    },
    moreOptionText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      textAlign: "right",
    },
    moreOptionTextActive: { color: colors.primary },
  });
