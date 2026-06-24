import React, { useMemo } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function AuthTextField({
  colors,
  value,
  onChangeText,
  onBlur,
  placeholder,
  invalid = false,
  keyboardType,
  autoCapitalize = "none",
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
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textAlign="right"
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    wrap: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.inputBg,
      minHeight: 46,
    },
    wrapInvalid: {
      borderColor: colors.error,
    },
    input: {
      fontSize: 15,
      color: colors.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
  });
