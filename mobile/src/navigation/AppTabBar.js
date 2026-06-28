import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  IconArchive,
  IconArchiveFilled,
  IconBook2,
  IconCamera,
  IconCameraFilled,
  IconInfoCircleFilled,
  IconQrcode,
} from "@tabler/icons-react-native";
import { useAccessibility } from "../context/AccessibilityContext";

const TAB_CONFIG = {
  MyCodes: {
    label: "קודים שמורים",
    Icon: IconArchive,
    IconActive: IconArchiveFilled,
  },
  QrGenerator: {
    label: "יצירת QR",
    Icon: IconQrcode,
    IconActive: IconQrcode,
  },
  QrScanner: {
    label: "סריקת QR",
    Icon: IconCamera,
    IconActive: IconCameraFilled,
  },
  LearnQr: {
    label: "מדריך",
    Icon: IconBook2,
    IconActive: IconInfoCircleFilled,
  },
};

function TabIcon({ config, focused, activeColor, inactiveColor }) {
  const IconComponent =
    focused && config.IconActive ? config.IconActive : config.Icon;

  return (
    <IconComponent
      size={24}
      color={focused ? activeColor : inactiveColor}
      strokeWidth={focused ? 2.1 : 1.75}
    />
  );
}

export default function AppTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useAccessibility();
  const styles = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const config = TAB_CONFIG[route.name] || {
            label: options.title || route.name,
            Icon: IconQrcode,
            IconActive: IconQrcode,
          };
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={config.label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tab,
                isFocused && styles.tabFocused,
                pressed && styles.tabPressed,
              ]}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapFocused]}>
                <TabIcon
                  config={config}
                  focused={isFocused}
                  activeColor={colors.primary}
                  inactiveColor={colors.subText}
                />
              </View>
              {isFocused ? <View style={styles.activeDot} /> : null}
              <Text
                style={[styles.label, isFocused && styles.labelFocused]}
                numberOfLines={1}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors, bottomInset) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: colors.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingBottom: Math.max(bottomInset, 8),
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: -2 },
      elevation: 12,
    },
    bar: {
      flexDirection: "row-reverse",
      alignItems: "stretch",
      paddingTop: 8,
      paddingHorizontal: 6,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 4,
      borderRadius: 14,
      minHeight: 58,
    },
    tabFocused: {
      backgroundColor: `${colors.primary}10`,
    },
    tabPressed: {
      opacity: 0.85,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },
    iconWrapFocused: {
      backgroundColor: `${colors.primary}16`,
    },
    activeDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
      marginBottom: 3,
    },
    label: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.subText,
      textAlign: "center",
    },
    labelFocused: {
      color: colors.primary,
      fontWeight: "700",
    },
  });
