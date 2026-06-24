import React, { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AppTabBar from "./AppTabBar";
import MyCodesScreen from "../screens/MyCodesScreen";
import QrGeneratorScreen from "../screens/QrGeneratorScreen";
import QrScannerScreen from "../screens/QrScannerScreen";
import LearnQrScreen from "../screens/LearnQrScreen";
import { useAccessibility } from "../context/AccessibilityContext";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { colors } = useAccessibility();
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      sceneStyle: { backgroundColor: colors.background },
    }),
    [colors.background],
  );

  return (
    <Tab.Navigator
      initialRouteName="MyCodes"
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={screenOptions}
    >
      <Tab.Screen name="MyCodes" component={MyCodesScreen} />
      <Tab.Screen
        name="QrGenerator"
        component={QrGeneratorScreen}
        getId={({ params }) => params?.savedQrId ?? "new"}
      />
      <Tab.Screen
        name="QrScanner"
        component={QrScannerScreen}
        options={{ unmountOnBlur: true }}
      />
      <Tab.Screen name="LearnQr" component={LearnQrScreen} />
    </Tab.Navigator>
  );
}
