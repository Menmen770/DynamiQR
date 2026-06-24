import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const W = 36;
const H = 20;
const TH = 16;
const PAD = 2;

/** מתג קטן כמו .dashboard-qr-toggle-mini באתר */
export default function QrMiniToggle({ value, onValueChange, disabled }) {
  const on = !!value;
  return (
    <Pressable
      onPress={() => !disabled && onValueChange?.(!on)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: on, disabled: !!disabled }}
      style={disabled ? s.dim : undefined}
    >
      <View style={s.track}>
        {on ? (
          <LinearGradient
            colors={["#5eead4", "#0a9396"]}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, s.off]} />
        )}
        <View style={[s.thumb, { left: on ? W - TH - PAD : PAD }]} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  dim: { opacity: 0.55 },
  track: { width: W, height: H, borderRadius: H / 2, overflow: "hidden" },
  off: { backgroundColor: "#cbd5e1" },
  thumb: {
    position: "absolute",
    top: PAD,
    width: TH,
    height: TH,
    borderRadius: TH / 2,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOpacity: 0.18,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});
