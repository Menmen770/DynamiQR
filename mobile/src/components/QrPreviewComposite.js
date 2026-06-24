import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  STICKER_QR_INNER_SCALE,
  STICKER_QR_NORMALIZED_RECT,
} from "../utils/qrConstantsMobile";
import { getBgGradientFill } from "../utils/qrGradientsMobile";
import { getStickerOverlayModule } from "../utils/stickerAssetsMobile";
import { loadSvgStringFromModule } from "../utils/svgDataUrlFromModule";
import StickerTintOverlay from "./StickerTintOverlay";
import SvgGradientFill from "./SvgGradientFill";

const QrPreviewComposite = React.forwardRef(function QrPreviewComposite(
  {
    colors,
    qrImage,
    loading,
    error,
    bgColorMode,
    bgSolidColor,
    bgGradient = null,
    stickerType,
    fgColor = "#000000",
    qrColorMode = "solid",
    dotsGradient = null,
    fillParent = false,
    previewSize = null,
    forExport = false,
  },
  ref,
) {
  const [overlayXml, setOverlayXml] = useState(null);
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [stagePx, setStagePx] = useState(280);

  const withSticker = stickerType && stickerType !== "none";

  useEffect(() => {
    let cancelled = false;
    if (!withSticker) {
      setOverlayXml(null);
      setOverlayLoading(false);
      return;
    }
    const mod = getStickerOverlayModule(stickerType);
    if (!mod) {
      setOverlayXml(null);
      setOverlayLoading(false);
      return;
    }
    setOverlayLoading(true);
    loadSvgStringFromModule(mod)
      .then((xml) => {
        if (!cancelled) setOverlayXml(xml);
      })
      .catch(() => {
        if (!cancelled) setOverlayXml(null);
      })
      .finally(() => {
        if (!cancelled) setOverlayLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stickerType, withSticker]);

  const { x, y, width, height } = STICKER_QR_NORMALIZED_RECT;
  const scale = withSticker ? STICKER_QR_INNER_SCALE : 1;
  const showLoading = !forExport && (loading || (withSticker && overlayLoading));
  const slotLeft = x + (width * (1 - scale)) / 2;
  const slotTop = y + (height * (1 - scale)) / 2;
  const slotW = width * scale;
  const slotH = height * scale;

  const bgLayer = useMemo(() => {
    if (bgColorMode === "none") {
      return <View style={[styles.checker, StyleSheet.absoluteFill]} />;
    }
    if (bgColorMode === "gradient") {
      const fill = getBgGradientFill(bgGradient, bgSolidColor || "#ffffff");
      if (forExport) {
        return <SvgGradientFill fill={fill} size={previewSize || stagePx} />;
      }
      return (
        <LinearGradient
          colors={fill.colors}
          locations={fill.locations}
          start={fill.start}
          end={fill.end}
          style={StyleSheet.absoluteFill}
        />
      );
    }
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: bgSolidColor || "#ffffff" },
        ]}
      />
    );
  }, [bgColorMode, bgSolidColor, bgGradient, forExport, previewSize, stagePx]);

  return (
    <View style={[styles.wrap, fillParent && styles.wrapFillParent]}>
      <View
        ref={ref}
        collapsable={false}
        style={[
          styles.stage,
          previewSize ? { width: previewSize, maxWidth: previewSize } : null,
          fillParent && styles.stageFillParent,
        ]}
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
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <StickerTintOverlay
              overlayXml={overlayXml}
              size={stagePx}
              fgColor={fgColor}
              qrColorMode={qrColorMode}
              dotsGradient={dotsGradient}
            />
          </View>
        ) : null}

        {showLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : null}
      </View>

      {error && !forExport ? (
        <Text style={[styles.err, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
});

export default QrPreviewComposite;

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
  },
  wrapFillParent: {
    width: "100%",
    height: "100%",
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
  stageFillParent: {
    maxWidth: undefined,
    width: "100%",
    height: "100%",
    aspectRatio: undefined,
    borderRadius: 0,
    borderWidth: 0,
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
