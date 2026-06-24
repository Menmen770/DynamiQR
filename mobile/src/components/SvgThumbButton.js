import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { loadSvgStringFromModule } from "../utils/svgDataUrlFromModule";

/**
 * כפתור עם תצוגה מקדימה של SVG (כמו תמונות הצורה באתר).
 */
export default function SvgThumbButton({
  assetModule,
  size = 48,
  selected,
  onPress,
  borderColor,
  activeBorderColor,
  disabled = false,
}) {
  const [xml, setXml] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setXml(null);
    loadSvgStringFromModule(assetModule)
      .then((t) => {
        if (!cancelled) setXml(t);
      })
      .catch(() => {
        if (!cancelled) setXml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [assetModule]);

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
        },
      ]}
      accessibilityRole="button"
    >
      {xml ? (
        <SvgXml xml={xml} width={size} height={size} />
      ) : (
        <View style={[styles.loader, { width: size, height: size }]}>
          <ActivityIndicator size="small" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  loader: {
    alignItems: "center",
    justifyContent: "center",
  },
});
