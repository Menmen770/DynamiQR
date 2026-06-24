import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { SvgXml } from "react-native-svg";
import {
  getStickerTintFill,
  overlayXmlForMask,
} from "../utils/qrGradientsMobile";

/**
 * מסגרת סטיקר צבועה בצבע/גרדיאנט ה-QR — כמו drawStickerImageComposite באתר.
 */
export default function StickerTintOverlay({
  overlayXml,
  size,
  fgColor,
  qrColorMode = "solid",
  dotsGradient = null,
}) {
  const maskXml = useMemo(() => overlayXmlForMask(overlayXml), [overlayXml]);
  const tint = useMemo(
    () => getStickerTintFill(qrColorMode, fgColor, dotsGradient),
    [qrColorMode, fgColor, dotsGradient],
  );

  if (!overlayXml || !size) return null;

  const maskElement = (
    <View style={[styles.maskBox, { width: size, height: size }]}>
      <SvgXml xml={maskXml} width={size} height={size} />
    </View>
  );

  const tintLayer =
    tint.type === "gradient" ? (
      <LinearGradient
        colors={tint.colors}
        locations={tint.locations}
        start={tint.start}
        end={tint.end}
        style={[styles.fill, { width: size, height: size }]}
      />
    ) : (
      <View
        style={[
          styles.fill,
          { width: size, height: size, backgroundColor: tint.color },
        ]}
      />
    );

  return (
    <MaskedView
      style={[styles.masked, { width: size, height: size }]}
      maskElement={maskElement}
    >
      {tintLayer}
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  masked: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  maskBox: {
    backgroundColor: "transparent",
  },
  fill: {
    flex: 1,
  },
});
