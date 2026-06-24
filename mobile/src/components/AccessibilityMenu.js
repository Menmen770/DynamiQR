import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconX } from "@tabler/icons-react-native";
import { useAccessibility } from "../context/AccessibilityContext";
import ThemeToggle from "./ThemeToggle";

export default function AccessibilityMenu({ visible, onClose }) {
  const {
    fontSize,
    readableFont,
    darkMode,
    setFontSize,
    setReadableFont,
    setDarkMode,
    reset,
    colors,
  } = useAccessibility();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[styles.menu, { backgroundColor: colors.card }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.header, { backgroundColor: "#0a9396" }]}>
            <Text style={styles.headerTitle}>אפשרויות נגישות</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <IconX size={20} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.subText }]}>
                גודל הטקסט
              </Text>
              <View style={styles.fontRow}>
                {["large", "normal", "small"].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontBtn,
                      {
                        borderColor: colors.border,
                        backgroundColor:
                          fontSize === size ? "#0a9396" : colors.card,
                      },
                      fontSize === size && styles.fontBtnActive,
                    ]}
                    onPress={() => setFontSize(size)}
                  >
                    <Text
                      style={[
                        styles.fontBtnText,
                        {
                          color: fontSize === size ? "#fff" : "#0a9396",
                        },
                      ]}
                    >
                      A
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.subText }]}>
                גופן קריא
              </Text>
              <TouchableOpacity
                style={[
                  styles.readableBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: readableFont ? "#0a9396" : colors.card,
                  },
                  readableFont && styles.fontBtnActive,
                ]}
                onPress={() => setReadableFont(!readableFont)}
              >
                <Text
                  style={[
                    styles.fontBtnText,
                    { color: readableFont ? "#fff" : "#0a9396" },
                  ]}
                >
                  Aa
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.subText }]}>
                מצב תצוגה
              </Text>
              <ThemeToggle value={darkMode} onValueChange={setDarkMode} />
            </View>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                reset();
                onClose();
              }}
            >
              <Text style={styles.resetBtnText}>איפוס הכל</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingBottom: 70,
    paddingLeft: 12,
  },
  menu: {
    width: 160,
    maxWidth: "85%",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#0a9396",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  closeBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  closeBtnText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 18,
  },
  content: {
    padding: 10,
    gap: 8,
  },
  section: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "right",
  },
  fontRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  fontBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  fontBtnActive: {
    backgroundColor: "#0a9396",
    borderColor: "#0a9396",
  },
  fontBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  fontBtnTextActive: {
    color: "#fff",
  },
  readableBtn: {
    width: 72,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  resetBtn: {
    width: "100%",
    paddingVertical: 8,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 2,
  },
  resetBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
