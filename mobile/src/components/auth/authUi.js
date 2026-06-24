import { StyleSheet } from "react-native";

export function createAuthUiStyles(colors) {
  return StyleSheet.create({
    fields: {
      gap: 10,
    },
    validationText: {
      fontSize: 12,
      color: colors.error,
      textAlign: "right",
      marginTop: -4,
    },
    errorBanner: {
      backgroundColor: colors.errorBg,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    errorText: {
      color: colors.errorText,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 19,
    },
    submitButton: {
      marginTop: 2,
      backgroundColor: colors.primary,
      borderRadius: 12,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "700",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 13,
      color: colors.subText,
      fontWeight: "500",
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 4,
    },
    footerText: {
      fontSize: 14,
      color: colors.subText,
    },
    footerLink: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "700",
      textDecorationLine: "underline",
    },
    legalRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8,
      paddingTop: 4,
    },
    footerDot: {
      fontSize: 14,
      color: colors.subText,
    },
  });
}
