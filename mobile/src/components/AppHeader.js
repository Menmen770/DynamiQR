import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  IconChevronDown,
  IconChevronUp,
  IconMail,
  IconShield,
  IconX,
} from "@tabler/icons-react-native";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { BRAND_LOGO } from "../constants/brand";
import ThemeToggle from "./ThemeToggle";
import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  parseJsonResponse,
} from "../utils/api";
import { row, textStart } from "../utils/layout";

const getGreetingByHour = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "בוקר טוב";
  if (hour >= 12 && hour < 17) return "צהריים טובים";
  if (hour >= 17 && hour < 21) return "ערב טוב";
  return "לילה טוב";
};

function getActiveRouteName(state) {
  if (!state) return undefined;
  const route = state.routes[state.index];
  if (route.state) return getActiveRouteName(route.state);
  return route.name;
}

export default function AppHeader() {
  const navigation = useNavigation();
  const { user, setUser, logout, getFirstName } = useAuth();
  const { colors, darkMode, setDarkMode } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [profileForm, setProfileForm] = useState({ firstName: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const currentRoute = getActiveRouteName(navigation.getState());
  const isOnScanner = currentRoute === "QrScanner";
  const isOnOverlayScreen = ["Contact", "Privacy"].includes(currentRoute);

  useEffect(() => {
    if (user) {
      setProfileForm({ firstName: getFirstName(user?.fullName) });
    }
  }, [user, getFirstName]);

  const togglePanel = (panel) => {
    setProfileMessage("");
    setExpandedPanel((p) => (p === panel ? null : panel));
  };

  const handleProfileSave = async () => {
    setProfileMessage("");
    setProfileSaving(true);
    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/auth/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: profileForm.firstName }),
        },
        20000,
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) throw new Error(data?.error || "שמירה נכשלה");
      setUser(data.user);
      setProfileForm({ firstName: getFirstName(data.user.fullName) });
      setProfileMessage("הפרטים נשמרו בהצלחה");
    } catch (err) {
      setProfileMessage(err.message || "שמירה נכשלה");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
  };

  const goToMyCodes = () => {
    navigation.navigate("MainTabs", { screen: "MyCodes" });
  };

  const firstName = getFirstName(user?.fullName) || "משתמש";
  const userInitial = firstName
    ? firstName.trim().charAt(0).toUpperCase()
    : "מ";
  const greeting = getGreetingByHour();

  const openStackScreen = (screen) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  if (isOnScanner || isOnOverlayScreen) return null;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.bar}>
        <View style={styles.sideUser}>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="הגדרות חשבון"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.userText}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {firstName}
            </Text>
          </View>
        </View>

        <View style={styles.sideBrand}>
          <TouchableOpacity
            onPress={goToMyCodes}
            activeOpacity={0.85}
            accessibilityLabel="קודים שמורים"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image
              source={BRAND_LOGO}
              style={styles.brandLogoBar}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.menuCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>הגדרות</Text>
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconX size={22} color={colors.subText} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.menuScroll}>
              <View style={styles.menuSection}>
                <TouchableOpacity
                  style={styles.expandBtn}
                  onPress={() => togglePanel("profile")}
                >
                  <Text style={styles.expandBtnText}>עדכון שם</Text>
                  {expandedPanel === "profile" ? (
                    <IconChevronUp
                      size={18}
                      color={colors.subText}
                      strokeWidth={2}
                    />
                  ) : (
                    <IconChevronDown
                      size={18}
                      color={colors.subText}
                      strokeWidth={2}
                    />
                  )}
                </TouchableOpacity>
                {expandedPanel === "profile" && (
                  <View style={styles.panelContent}>
                    <Text style={styles.panelLabel}>שם פרטי</Text>
                    <TextInput
                      style={styles.panelInput}
                      value={profileForm.firstName}
                      onChangeText={(t) =>
                        setProfileForm((p) => ({ ...p, firstName: t }))
                      }
                      placeholder="השם שלך"
                      placeholderTextColor={colors.subText}
                      textAlign="right"
                    />
                    <Text style={styles.panelLabel}>אימייל</Text>
                    <TextInput
                      style={[styles.panelInput, styles.panelInputDisabled]}
                      value={user?.email || ""}
                      editable={false}
                      textAlign="right"
                    />
                    <TouchableOpacity
                      style={[
                        styles.saveBtn,
                        profileSaving && styles.saveBtnDisabled,
                      ]}
                      onPress={handleProfileSave}
                      disabled={profileSaving}
                    >
                      {profileSaving ? (
                        <ActivityIndicator color={colors.white} size="small" />
                      ) : (
                        <Text style={styles.saveBtnText}>שמירת פרטים</Text>
                      )}
                    </TouchableOpacity>
                    {profileMessage ? (
                      <Text
                        style={[
                          styles.profileMsg,
                          profileMessage.includes("נשמרו")
                            ? styles.profileMsgSuccess
                            : styles.profileMsgError,
                        ]}
                      >
                        {profileMessage}
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>
              <View style={styles.menuSection}>
                <TouchableOpacity
                  style={styles.menuLinkBtn}
                  onPress={() => openStackScreen("Contact")}
                >
                  <IconMail size={18} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.menuLinkText}>צור קשר</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuLinkBtn}
                  onPress={() => openStackScreen("Privacy")}
                >
                  <IconShield
                    size={18}
                    color={colors.primary}
                    strokeWidth={2}
                  />
                  <Text style={styles.menuLinkText}>פרטיות ותנאים</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.menuSection}>
                <View style={styles.themeRow}>
                  <Text style={styles.themeLabel}>מצב תצוגה</Text>
                  <ThemeToggle value={darkMode} onValueChange={setDarkMode} />
                </View>
              </View>
              <View style={styles.menuSection}>
                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutBtnText}>התנתקות</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: colors.background,
      overflow: "visible",
      zIndex: 10,
      marginBottom: 4,
    },
    bar: {
      flexDirection: "row",
      direction: "ltr",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 24,
      paddingVertical: 10,
      minHeight: 56,
    },
    sideUser: {
      flexDirection: "row",
      direction: "ltr",
      alignItems: "center",
      gap: 6,
      flexShrink: 1,
      minWidth: 0,
      maxWidth: "58%",
    },
    sideBrand: {
      flexShrink: 0,
      marginLeft: 24,
      paddingLeft: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    brandLogoBar: {
      height: 50,
      width: 152,
      maxWidth: "100%",
      backgroundColor: "transparent",
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: colors.white, fontSize: 15, fontWeight: "700" },
    userText: {
      flexShrink: 1,
      minWidth: 0,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    greeting: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.subText,
      ...textStart,
      marginBottom: 0,
      lineHeight: 14,
    },
    userName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      ...textStart,
      lineHeight: 20,
      marginTop: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      paddingTop: 56,
      paddingHorizontal: 14,
    },
    menuCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      width: 300,
      maxHeight: 420,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    menuHeader: {
      ...row,
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    menuTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
      ...textStart,
    },
    menuScroll: { maxHeight: 360 },
    menuSection: {
      padding: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    menuLinkBtn: {
      ...row,
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
    },
    menuLinkText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      ...textStart,
    },
    themeRow: {
      ...row,
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    themeLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      ...textStart,
    },
    expandBtn: {
      ...row,
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    expandBtnText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      ...textStart,
    },
    panelContent: { marginTop: 4, paddingTop: 8 },
    panelLabel: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.subText,
      marginBottom: 4,
      ...textStart,
    },
    panelInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
      backgroundColor: colors.inputBg,
      color: colors.text,
      fontSize: 15,
    },
    panelInputDisabled: {
      backgroundColor: colors.toggleBg,
      color: colors.subText,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 4,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: colors.white, fontSize: 14, fontWeight: "600" },
    profileMsg: { fontSize: 12, marginTop: 8, textAlign: "center" },
    profileMsgSuccess: { color: colors.primary, fontWeight: "600" },
    profileMsgError: { color: colors.error },
    logoutBtn: { paddingVertical: 12, alignItems: "center" },
    logoutBtnText: { fontSize: 15, fontWeight: "600", color: colors.error },
  });
