import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  parseJsonResponse,
} from "../../utils/api";
import QrMiniToggle from "../QrMiniToggle";

export default function DynamicQrEditModal({
  visible,
  onClose,
  colors,
  row,
  onSaved,
  onError,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [targetUrl, setTargetUrl] = useState("");
  const [paused, setPaused] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !row) return;
    setTargetUrl(String(row.dynamicTargetUrl || "").trim());
    setPaused(row.redirectPaused === true);
  }, [visible, row]);

  const handleSave = useCallback(async () => {
    if (!row?._id) return;
    setSaving(true);
    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/saved-qrs/${row._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dynamicTargetUrl: targetUrl.trim(),
            redirectPaused: paused,
          }),
        },
        20000,
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || "שמירה נכשלה");
      }
      if (data?.saved) {
        onSaved(data.saved);
        onClose();
      }
    } catch (err) {
      onError(err.message || "שמירה נכשלה");
    } finally {
      setSaving(false);
    }
  }, [row?._id, targetUrl, paused, onSaved, onClose, onError]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !saving && onClose()}
    >
      <Pressable style={styles.overlay} onPress={() => !saving && onClose()}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>יעד הפניה</Text>
          <Text style={styles.hint}>
            יעד אחרי הסריקה (כתובת אתר, mailto, טלפון או SMS). הקישור הקצר ב־QR
            נשאר קבוע.
          </Text>
          <Text style={styles.label}>יעד הפניה</Text>
          <TextInput
            style={styles.input}
            value={targetUrl}
            onChangeText={setTargetUrl}
            placeholder="https://… או mailto:… / tel:…"
            placeholderTextColor={colors.subText}
            textAlign="right"
            autoCapitalize="none"
            editable={!saving}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>השהיית הפניה</Text>
            <QrMiniToggle
              value={paused}
              onValueChange={setPaused}
              disabled={saving}
            />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelText}>ביטול</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.saveText}>שמור</Text>
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
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      padding: 20,
    },
    sheet: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
      marginBottom: 8,
    },
    hint: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.subText,
      textAlign: "right",
      marginBottom: 14,
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
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.inputBg,
      color: colors.text,
      fontSize: 15,
      marginBottom: 14,
    },
    switchRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    switchLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      textAlign: "right",
      marginLeft: 10,
    },
    actions: {
      flexDirection: "row-reverse",
      gap: 10,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    cancelText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    saveBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    saveBtnDisabled: {
      opacity: 0.7,
    },
    saveText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.white,
    },
  });
