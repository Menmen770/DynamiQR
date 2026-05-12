import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import {
  STICKER_QR_INNER_SCALE,
  STICKER_QR_NORMALIZED_RECT,
} from "../utils/qrConstantsMobile";
import { getStickerOverlayModule } from "../utils/stickerAssetsMobile";
import { loadSvgStringFromModule } from "../utils/svgDataUrlFromModule";

export default function QrPreviewComposite({
  colors,
  qrImage,
  loading,
  error,
  bgColorMode,
  bgSolidColor,
  stickerType,
}) {
  const [overlayXml, setOverlayXml] = useState(null);
  const [stagePx, setStagePx] = useState(280);

  useEffect(() => {
    let cancelled = false;
    if (!stickerType || stickerType === "none") {
      setOverlayXml(null);
      return;
    }
    const mod = getStickerOverlayModule(stickerType);
    if (!mod) {
      setOverlayXml(null);
      return;
    }
    loadSvgStringFromModule(mod)
      .then((xml) => {
        if (!cancelled) setOverlayXml(xml);
      })
      .catch(() => {
        if (!cancelled) setOverlayXml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [stickerType]);

  const { x, y, width, height } = STICKER_QR_NORMALIZED_RECT;
  const withSticker = stickerType && stickerType !== "none";
  const scale = withSticker ? STICKER_QR_INNER_SCALE : 1;
  const slotLeft = x + (width * (1 - scale)) / 2;
  const slotTop = y + (height * (1 - scale)) / 2;
  const slotW = width * scale;
  const slotH = height * scale;

  const bgLayer =
    bgColorMode === "none" ? (
      <View style={[styles.checker, StyleSheet.absoluteFill]} />
    ) : (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: bgSolidColor || "#ffffff" },
        ]}
      />
    );

  return (
    <View style={styles.wrap}>
      <View
        style={styles.stage}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setStagePx(w);
        }}
      >
        {bgLayer}

        {qrImage ? (
          <View
            style={[
              styles.qrSlot,
              {
                left: `${slotLeft * 100}%`,
                top: `${slotTop * 100}%`,
                width: `${slotW * 100}%`,
                height: `${slotH * 100}%`,
              },
            ]}
          >
            <Image
              source={{ uri: qrImage }}
              style={styles.qrImg}
              resizeMode="contain"
            />
          </View>
        ) : null}

        {withSticker && overlayXml ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.overlaySvg]}
          >
            <SvgXml xml={overlayXml} width={stagePx} height={stagePx} />
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.err, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
  },
  stage: {
    width: "100%",
    maxWidth: 320,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
  },
  checker: {
    backgroundColor: "#e8e8e8",
    opacity: 0.9,
  },
  qrSlot: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  qrImg: {
    width: "100%",
    height: "100%",
  },
  overlaySvg: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  err: {
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
  },
});
