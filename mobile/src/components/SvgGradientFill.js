import React, { useId, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

/**
 * רקע גרדיאנט ב-SVG — נכנס ל-view-shot (בניגוד ל-expo-linear-gradient).
 */
export default function SvgGradientFill({ fill, style, size }) {
  const gradId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const dim = size ? String(size) : "100%";
  const stops = useMemo(() => {
    const colors = fill?.colors || ["#ffffff", "#cccccc"];
    const locations = fill?.locations || colors.map((_, i) => i / (colors.length - 1 || 1));
    return colors.map((color, i) => ({
      color,
      offset: locations[i] ?? i / (colors.length - 1 || 1),
    }));
  }, [fill]);

  const x1 = `${(fill?.start?.x ?? 0) * 100}%`;
  const y1 = `${(fill?.start?.y ?? 0) * 100}%`;
  const x2 = `${(fill?.end?.x ?? 1) * 100}%`;
  const y2 = `${(fill?.end?.y ?? 1) * 100}%`;

  return (
    <View style={[StyleSheet.absoluteFill, style]} collapsable={false}>
      <Svg width={dim} height={dim} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1={x1} y1={y1} x2={x2} y2={y2}>
            {stops.map((stop, i) => (
              <Stop
                key={`${stop.color}-${i}`}
                offset={String(stop.offset)}
                stopColor={stop.color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={dim} height={dim} fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}
