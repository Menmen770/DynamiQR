import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GENERATOR_STEPS } from "../utils/qrConstantsMobile";

export default function GeneratorStepNav({ colors, activeStep, onStepChange }) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.bar}>
      {GENERATOR_STEPS.map((step, idx) => {
        const active = activeStep === step.id;
        return (
          <TouchableOpacity
            key={step.id}
            style={[styles.item, active && styles.itemActive]}
            onPress={() => onStepChange(step.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.badge, active && styles.badgeActive]}>
              <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                {step.icon}
              </Text>
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
              {step.label}
            </Text>
            {idx < GENERATOR_STEPS.length - 1 ? (
              <View style={styles.connector} />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    bar: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    item: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 8,
      borderRadius: 12,
      position: "relative",
    },
    itemActive: {
      backgroundColor: "rgba(10, 147, 150, 0.08)",
    },
    badge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    badgeActive: {
      backgroundColor: colors.primary,
    },
    badgeText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.subText,
    },
    badgeTextActive: {
      color: colors.white,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.subText,
    },
    labelActive: {
      color: colors.primary,
      fontWeight: "700",
    },
    connector: {
      position: "absolute",
      right: -8,
      top: 22,
      width: 16,
      height: 2,
      backgroundColor: colors.border,
    },
  });
