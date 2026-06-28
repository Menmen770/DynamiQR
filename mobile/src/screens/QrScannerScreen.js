import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  IconBolt,
  IconBoltOff,
  IconScan,
} from "@tabler/icons-react-native";
import { useAccessibility } from "../context/AccessibilityContext";
import ScreenWithAccessibility from "../components/ScreenWithAccessibility";

const isUrl = (str) => {
  const s = String(str || "").trim();
  return /^https?:\/\//i.test(s);
};

const CORNER_SIZE = 26;
const CORNER_THICKNESS = 4;
const TAB_BAR_HEIGHT = 74;

function ScanCorners({ color }) {
  const cornerBase = {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: color,
  };

  return (
    <>
      <View
        style={[
          cornerBase,
          {
            top: 0,
            left: 0,
            borderTopWidth: CORNER_THICKNESS,
            borderLeftWidth: CORNER_THICKNESS,
            borderTopLeftRadius: 14,
          },
        ]}
      />
      <View
        style={[
          cornerBase,
          {
            top: 0,
            right: 0,
            borderTopWidth: CORNER_THICKNESS,
            borderRightWidth: CORNER_THICKNESS,
            borderTopRightRadius: 14,
          },
        ]}
      />
      <View
        style={[
          cornerBase,
          {
            bottom: 0,
            left: 0,
            borderBottomWidth: CORNER_THICKNESS,
            borderLeftWidth: CORNER_THICKNESS,
            borderBottomLeftRadius: 14,
          },
        ]}
      />
      <View
        style={[
          cornerBase,
          {
            bottom: 0,
            right: 0,
            borderBottomWidth: CORNER_THICKNESS,
            borderRightWidth: CORNER_THICKNESS,
            borderBottomRightRadius: 14,
          },
        ]}
      />
    </>
  );
}

export default function QrScannerScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { colors } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const frameSize = Math.min(screenW * 0.74, 292);
  const horizontalPad = (screenW - frameSize) / 2;
  const tabBarReserve = TAB_BAR_HEIGHT + Math.max(insets.bottom, 8);

  // מרכז המסגרת באזור אמצע המסך ומעט מעליו (לא נמוך מדי)
  const frameCenterY = screenH * 0.4;
  const frameTop = Math.max(insets.top + 48, frameCenterY - frameSize / 2);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setTorchOn(false);
        setCameraReady(false);
      };
    }, []),
  );

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    const url = String(data || "").trim();
    if (isUrl(url)) {
      Linking.openURL(url).catch(() => {
        Alert.alert("שגיאה", "לא ניתן לפתוח את הקישור");
      });
      setScanned(false);
    } else {
      Alert.alert("תוכן שנסרק", url || "לא נמצא תוכן", [
        {
          text: "סגור",
          onPress: () => setScanned(false),
        },
      ]);
    }
  };

  const showCamera = isFocused && permission?.granted;
  const toggleTorch = () => {
    if (!cameraReady) return;
    setTorchOn((prev) => !prev);
  };

  if (!permission) {
    return (
      <ScreenWithAccessibility>
        <View style={styles.center}>
          <Text style={styles.message}>טוען...</Text>
        </View>
      </ScreenWithAccessibility>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenWithAccessibility>
        <View style={styles.container}>
          <View style={styles.permissionCard}>
            <View style={styles.permissionIconWrap}>
              <IconScan size={32} color={colors.primary} strokeWidth={1.75} />
            </View>
            <Text style={styles.permissionTitle}>נדרשת הרשאת מצלמה</Text>
            <Text style={styles.permissionText}>
              כדי לסרוק קודי QR, יש לאפשר גישה למצלמה
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
              activeOpacity={0.88}
            >
              <Text style={styles.permissionButtonText}>אפשר גישה</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWithAccessibility>
    );
  }

  return (
    <ScreenWithAccessibility>
      <View style={styles.cameraContainer}>
        {showCamera ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            enableTorch={torchOn}
            onCameraReady={() => setCameraReady(true)}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
        ) : null}

        <View style={styles.overlay} pointerEvents="box-none">
          <View
            style={[
              styles.mask,
              { top: 0, left: 0, right: 0, height: frameTop },
            ]}
          />
          <View
            style={[
              styles.mask,
              {
                top: frameTop + frameSize,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
          />
          <View
            style={[
              styles.mask,
              {
                top: frameTop,
                left: 0,
                width: horizontalPad,
                height: frameSize,
              },
            ]}
          />
          <View
            style={[
              styles.mask,
              {
                top: frameTop,
                right: 0,
                width: horizontalPad,
                height: frameSize,
              },
            ]}
          />
          <View
            style={[
              styles.scanWindow,
              {
                top: frameTop,
                left: horizontalPad,
                width: frameSize,
                height: frameSize,
              },
            ]}
          >
            <ScanCorners color="#ffffff" />
          </View>

          <View
            style={[styles.topBar, { paddingTop: insets.top + 8 }]}
            pointerEvents="box-none"
          >
            <View style={styles.iconButtonSpacer} />

            <View style={styles.topTitleWrap}>
              <Text style={styles.topTitle}>סריקת QR</Text>
              <Text style={styles.topSubtitle}>כוון את המצלמה לקוד</Text>
            </View>

            {Platform.OS !== "web" ? (
              <TouchableOpacity
                style={[styles.iconButton, torchOn && styles.iconButtonActive]}
                onPress={toggleTorch}
                activeOpacity={0.85}
                disabled={!cameraReady}
                accessibilityLabel={torchOn ? "כבה פלאש" : "הדלק פלאש"}
              >
                {torchOn ? (
                  <IconBolt size={22} color={colors.primary} strokeWidth={2.2} />
                ) : (
                  <IconBoltOff size={22} color="#fff" strokeWidth={2} />
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.iconButtonSpacer} />
            )}
          </View>

          <View
            style={[
              styles.bottomPanel,
              { bottom: tabBarReserve, paddingBottom: 12 },
            ]}
            pointerEvents="box-none"
          >
            <Text style={styles.scanHint}>
              מקם את קוד ה-QR בתוך המסגרת
            </Text>
            <Text style={styles.scanSubHint}>
              הקישור ייפתח אוטומטית לאחר סריקה מוצלחת
            </Text>
          </View>
        </View>
      </View>
    </ScreenWithAccessibility>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    message: {
      fontSize: 16,
      color: colors.subText,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    permissionCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 28,
      alignItems: "center",
      width: "100%",
      maxWidth: 360,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    permissionIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: `${colors.primary}14`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    permissionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
      textAlign: "center",
    },
    permissionText: {
      fontSize: 15,
      color: colors.subText,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
    },
    permissionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 12,
      width: "100%",
      alignItems: "center",
    },
    permissionButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "700",
    },
    cameraContainer: {
      flex: 1,
      backgroundColor: "#000",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
    },
    mask: {
      position: "absolute",
      backgroundColor: "rgba(0,0,0,0.58)",
    },
    scanWindow: {
      position: "absolute",
      backgroundColor: "transparent",
    },
    topBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    topTitleWrap: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 8,
    },
    topTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: "#fff",
      textAlign: "center",
    },
    topSubtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "500",
      color: "rgba(255,255,255,0.78)",
      textAlign: "center",
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.18)",
    },
    iconButtonActive: {
      backgroundColor: "rgba(255,255,255,0.95)",
    },
    iconButtonSpacer: {
      width: 44,
      height: 44,
    },
    bottomPanel: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    scanHint: {
      fontSize: 16,
      color: "#fff",
      fontWeight: "700",
      textAlign: "center",
    },
    scanSubHint: {
      marginTop: 6,
      fontSize: 13,
      color: "rgba(255,255,255,0.72)",
      textAlign: "center",
      lineHeight: 20,
    },
  });
