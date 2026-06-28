import "./src/bootstrap/rtl";

import React from "react";

import { ActivityIndicator, I18nManager, StatusBar, StyleSheet, View } from "react-native";

import {

  NavigationContainer,

  createNavigationContainerRef,

} from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/context/AuthContext";

import {

  AccessibilityProvider,

  useAccessibility,

} from "./src/context/AccessibilityContext";

import AppHeader from "./src/components/AppHeader";

import MainTabNavigator from "./src/navigation/MainTabNavigator";

import LoginScreen from "./src/screens/LoginScreen";

import RegisterScreen from "./src/screens/RegisterScreen";

import VerifyEmailScreen from "./src/screens/VerifyEmailScreen";

import ContactScreen from "./src/screens/ContactScreen";

import PrivacyScreen from "./src/screens/PrivacyScreen";



const AuthStack = createNativeStackNavigator();

const AppStack = createNativeStackNavigator();

const navigationRef = createNavigationContainerRef();



function AuthNavigator() {

  const { colors } = useAccessibility();

  return (

    <AuthStack.Navigator

      initialRouteName="Register"

      screenOptions={{

        headerShown: false,

        gestureEnabled: false,

        contentStyle: { backgroundColor: colors.background },

      }}

    >

      <AuthStack.Screen name="Register" component={RegisterScreen} />

      <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />

      <AuthStack.Screen name="Login" component={LoginScreen} />

      <AuthStack.Screen name="Contact" component={ContactScreen} />

      <AuthStack.Screen name="Privacy" component={PrivacyScreen} />

    </AuthStack.Navigator>

  );

}



function AppNavigator() {

  const { colors } = useAccessibility();

  return (

    <>

      <AppHeader />

      <View style={styles.navHost}>

        <AppStack.Navigator

          initialRouteName="MainTabs"

          screenOptions={{

            headerShown: false,

            contentStyle: { backgroundColor: colors.background },

          }}

        >

          <AppStack.Screen name="MainTabs" component={MainTabNavigator} />

          <AppStack.Screen name="Contact" component={ContactScreen} />

          <AppStack.Screen name="Privacy" component={PrivacyScreen} />

        </AppStack.Navigator>

      </View>

    </>

  );

}



function RootNavigator() {

  const { user, checkingAuth } = useAuth();

  const { colors, darkMode } = useAccessibility();



  if (checkingAuth) {

    return (

      <View style={[styles.boot, { backgroundColor: colors.background }]}>

        <ActivityIndicator size="large" color={colors.primary} />

      </View>

    );

  }



  return (

    <>

      <StatusBar

        barStyle={darkMode ? "light-content" : "dark-content"}

        backgroundColor={colors.background}

      />

      <View

        style={[styles.container, { backgroundColor: colors.background, direction: "rtl" }]}

      >

        {user ? <AppNavigator /> : <AuthNavigator />}

      </View>

    </>

  );

}



export default function App() {

  return (

    <SafeAreaProvider>

      <AuthProvider>

        <AccessibilityProvider>

          <NavigationContainer

            ref={navigationRef}

            direction={I18nManager.isRTL ? "rtl" : "ltr"}

          >

            <RootNavigator />

          </NavigationContainer>

        </AccessibilityProvider>

      </AuthProvider>

    </SafeAreaProvider>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

  },

  navHost: {

    flex: 1,

  },

  boot: {

    flex: 1,

    alignItems: "center",

    justifyContent: "center",

  },

});

