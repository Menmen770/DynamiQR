import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAccessibility } from "../../context/AccessibilityContext";
import { row } from "../../utils/layout";

export default function SimplePromptModal({
  visible,
  onClose,
  title,
  description,
  label,
  placeholder,
  confirmLabel = "שמור",
  defaultValue = "",
  maxLength = 120,
  busy = false,
  onConfirm,
}) {
  const { colors } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (visible) setValue(defaultValue);
  }, [visible, defaultValue]);

  const handleConfirm = async () => {
    const ok = await onConfirm(value);
    if (ok !== false) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !busy && onClose()}
    >
      <Pressable style={styles.overlay} onPress={() => !busy && onClose()}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={colors.subText}
            maxLength={maxLength}
            editable={!busy}
            textAlign="right"
            autoFocus
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={busy}
            >
              <Text style={styles.cancelText}>ביטול</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, busy && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
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
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: colors.subText,
      textAlign: "right",
      lineHeight: 22,
      marginBottom: 12,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
      textAlign: "right",
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.inputBg,
      marginBottom: 16,
    },
    actions: {
      ...row,
      gap: 10,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    cancelText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.subText,
    },
    confirmBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    confirmBtnDisabled: {
      opacity: 0.7,
    },
    confirmText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.white,
    },
  });
