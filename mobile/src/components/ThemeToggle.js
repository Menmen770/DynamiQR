import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { IconMoon, IconSun } from "@tabler/icons-react-native";
import { IS_RTL } from "../bootstrap/rtl";

const TRACK_WIDTH = 58;
const TRACK_HEIGHT = 30;
const PADDING = 3;
const THUMB_SIZE = 24;
const TRAVEL = TRACK_WIDTH - PADDING * 2 - THUMB_SIZE;
const ICON_SIZE = 14;

const LIGHT_TRACK = "#FDF0C4";
const LIGHT_THUMB = "#F5C518";
const DARK_TRACK = "#042f44";
const DARK_THUMB = "#3db8e8";

export default function ThemeToggle({ value, onValueChange }) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 320,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value, progress]);

  const thumbTravel = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL],
  });

  const thumbTranslateX = IS_RTL
    ? Animated.multiply(thumbTravel, -1)
    : thumbTravel;

  const trackBg = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [LIGHT_TRACK, DARK_TRACK],
  });

  const thumbBg = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [LIGHT_THUMB, DARK_THUMB],
  });

  const sunOpacity = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0, 0],
  });

  const moonOpacity = progress.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={value ? "מצב לילה" : "מצב יום"}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={styles.hitArea}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackBg }]}>
        <Animated.View
          style={[
            styles.thumb,
            IS_RTL ? styles.thumbRtl : styles.thumbLtr,
            {
              backgroundColor: thumbBg,
              transform: [{ translateX: thumbTranslateX }],
            },
          ]}
        >
          <View style={styles.iconLayer}>
            <Animated.View style={[styles.iconSlot, { opacity: sunOpacity }]}>
              <IconSun
                size={ICON_SIZE}
                color="#ffffff"
                strokeWidth={2.1}
              />
            </Animated.View>
            <Animated.View
              style={[styles.iconSlot, styles.iconSlotOverlay, { opacity: moonOpacity }]}
            >
              <IconMoon
                size={ICON_SIZE}
                color="#ffffff"
                strokeWidth={2.1}
              />
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    alignSelf: "center",
    direction: "ltr",
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: "center",
    overflow: "hidden",
    direction: "ltr",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  thumb: {
    position: "absolute",
    top: PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    direction: "ltr",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1,
    elevation: 2,
  },
  thumbLtr: {
    left: PADDING,
  },
  thumbRtl: {
    right: PADDING,
  },
  iconLayer: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    direction: "ltr",
  },
  iconSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconSlotOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
