import React, { useMemo } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { IconEye, IconEyeOff } from "@tabler/icons-react-native";

export default function AuthPasswordField({
  colors,
  value,
  onChangeText,
  onBlur,
  placeholder,
  invalid = false,
  showPassword,
  onToggleShow,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.wrap, invalid && styles.wrapInvalid]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.subText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        textAlign="right"
      />
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onToggleShow}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
      >
        {showPassword ? (
          <IconEyeOff size={20} color={colors.subText} strokeWidth={1.75} />
        ) : (
          <IconEye size={20} color={colors.subText} strokeWidth={1.75} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.inputBg,
      minHeight: 46,
      paddingHorizontal: 4,
    },
    wrapInvalid: {
      borderColor: colors.error,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
  });
