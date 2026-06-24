import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "accessibility_settings";

const lightColors = {
  background: "#f5f7fb",
  card: "#ffffff",
  text: "#1f2a33",
  subText: "#6b7280",
  border: "#d1d5db",
  primary: "#0a9396",
  primaryDark: "#087b7d",
  white: "#ffffff",
  error: "#b91c1c",
  inputBg: "#ffffff",
  toggleBg: "#f8f9fa",
  errorBg: "#f8d7da",
  errorText: "#842029",
};

const darkColors = {
  background: "#1a1a1a",
  card: "#2d3748",
  text: "#f3f4f6",
  subText: "#9ca3af",
  border: "#4a5568",
  primary: "#0a9396",
  primaryDark: "#5eead4",
  white: "#ffffff",
  error: "#ef4444",
  inputBg: "#374151",
  toggleBg: "#374151",
  errorBg: "#7f1d1d",
  errorText: "#fecaca",
};

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const [fontSize, setFontSizeState] = useState("normal");
  const [readableFont, setReadableFontState] = useState(false);
  const [darkMode, setDarkModeState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.fontSize) setFontSizeState(data.fontSize);
          if (typeof data.readableFont === "boolean")
            setReadableFontState(data.readableFont);
          if (typeof data.darkMode === "boolean") setDarkModeState(data.darkMode);
        }
      } catch (e) {
        console.warn("Accessibility load error:", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = async (data) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : {};
      const next = { ...current, ...data };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("Accessibility persist error:", e);
    }
  };

  const setFontSize = (size) => {
    setFontSizeState(size);
    persist({ fontSize: size });
  };

  const setReadableFont = (value) => {
    setReadableFontState(value);
    persist({ readableFont: value });
  };

  const setDarkMode = (value) => {
    setDarkModeState(value);
    persist({ darkMode: value });
  };

  const reset = () => {
    setFontSizeState("normal");
    setReadableFontState(false);
    setDarkModeState(false);
    persist({ fontSize: "normal", readableFont: false, darkMode: false });
  };

  const colors = darkMode ? darkColors : lightColors;

  const value = {
    fontSize,
    readableFont,
    darkMode,
    setFontSize,
    setReadableFont,
    setDarkMode,
    reset,
    colors,
    loaded,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return {
    ...ctx,
    colors: ctx.colors || lightColors,
  };
}
