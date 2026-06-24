import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

/**
 * כפתור עם תצוגה מקדימה PNG (למשל פינות QR — SVG עם mask לא נתמך ב־react-native-svg).
 */
export default function ImageThumbButton({
  imageModule,
  size = 48,
  selected,
  onPress,
  borderColor,
  activeBorderColor,
  disabled = false,
  previewBackground = "#ffffff",
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.btn,
        {
          width: size + 12,
          height: size + 12,
          borderColor: selected ? activeBorderColor : borderColor,
          borderWidth: selected ? 3 : 1,
          backgroundColor: selected
            ? "rgba(10, 147, 150, 0.08)"
            : previewBackground,
        },
      ]}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.imgWrap,
          { width: size, height: size, backgroundColor: previewBackground },
        ]}
      >
        <Image
          source={imageModule}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  imgWrap: {
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
