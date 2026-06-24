import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconArrowRight, IconMail, IconShield } from "@tabler/icons-react-native";
import { useNavigation } from "@react-navigation/native";
import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  parseJsonResponse,
} from "../../utils/api";
export default function MyCodesAccountPanel({ colors, onClose, onProfileSaved }) {
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [initialFullName, setInitialFullName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const loadMe = useCallback(async () => {
    setLoading(true);
    setProfileMsg("");
    setPasswordMsg("");
    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/auth/me`,
        { method: "GET" },
        20000,
      );
      if (!response.ok) return;
      const data = await parseJsonResponse(response);
      const u = data?.user;
      if (!u) return;
      const name = String(u.fullName || "").trim();
      setInitialFullName(name);
      setFullName(name);
      setEmail(String(u.email || ""));
      setHasPassword(Boolean(u.hasPassword));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const saveProfile = async () => {
    setProfileMsg("");
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setProfileMsg("שם מלא חייב להכיל לפחות שני תווים");
      return;
    }
    if (trimmed === initialFullName) {
      setProfileMsg("לא שינית את השם — אין מה לשמור");
      return;
    }
    setSavingProfile(true);
    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/auth/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: trimmed }),
        },
        20000,
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        setProfileMsg(data?.error || "שמירת הפרופיל נכשלה");
        return;
      }
      if (data?.user) {
        const name = String(data.user.fullName || "").trim();
        setInitialFullName(name);
        setFullName(name);
        setHasPassword(Boolean(data.user.hasPassword));
        onProfileSaved?.(data.user);
      }
      onClose();
    } catch {
      setProfileMsg("שגיאת רשת");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setPasswordMsg("");
    if (!newPassword || newPassword.length < 7) {
      setPasswordMsg("הסיסמה החדשה חייבת לכלול לפחות 7 תווים");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("הסיסמה החדשה והאימות אינם תואמים");
      return;
    }
    setSavingPassword(true);
    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/auth/password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        },
        20000,
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        setPasswordMsg(data?.error || "עדכון הסיסמה נכשל");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg("הסיסמה עודכנה בהצלחה");
    } catch {
      setPasswordMsg("שגיאת רשת");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backRow} onPress={onClose}>
        <IconArrowRight size={20} color={colors.primary} />
        <Text style={styles.backText}>חזרה לקודים</Text>
      </TouchableOpacity>

      <Text style={styles.panelTitle}>עדכון פרטים</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>שם מלא</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="השם שלך"
          placeholderTextColor={colors.subText}
          textAlign="right"
        />
        <Text style={styles.emailHint}>אימייל: {email || "—"}</Text>
        {profileMsg ? <Text style={styles.errorText}>{profileMsg}</Text> : null}
        <TouchableOpacity
          style={[styles.primaryBtn, savingProfile && styles.btnDisabled]}
          onPress={saveProfile}
          disabled={savingProfile}
        >
          {savingProfile ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>שמור שם</Text>
          )}
        </TouchableOpacity>
      </View>

      {hasPassword ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>שינוי סיסמה</Text>
          <Text style={styles.fieldLabel}>סיסמה נוכחית</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            textAlign="right"
            placeholderTextColor={colors.subText}
          />
          <Text style={styles.fieldLabel}>סיסמה חדשה</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            textAlign="right"
            placeholderTextColor={colors.subText}
          />
          <Text style={styles.fieldLabel}>אימות סיסמה</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textAlign="right"
            placeholderTextColor={colors.subText}
          />
          {passwordMsg ? (
            <Text
              style={
                passwordMsg.includes("עודכנה")
                  ? styles.successText
                  : styles.errorText
              }
            >
              {passwordMsg}
            </Text>
          ) : null}
          <TouchableOpacity
            style={[styles.outlineBtn, savingPassword && styles.btnDisabled]}
            onPress={savePassword}
            disabled={savingPassword}
          >
            {savingPassword ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.outlineBtnText}>עדכן סיסמה</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.legalLinks}>
        <TouchableOpacity
          style={styles.legalLinkBtn}
          onPress={() => {
            onClose();
            navigation.navigate("Contact");
          }}
        >
          <IconMail size={16} color={colors.primary} strokeWidth={2} />
          <Text style={styles.legalLinkText}>צור קשר</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.legalLinkBtn}
          onPress={() => {
            onClose();
            navigation.navigate("Privacy");
          }}
        >
          <IconShield size={16} color={colors.primary} strokeWidth={2} />
          <Text style={styles.legalLinkText}>פרטיות ותנאים</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      paddingHorizontal: 20,
    },
    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
    },
    backRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
      alignSelf: "flex-end",
    },
    backText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.primary,
    },
    panelTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
      marginBottom: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      textAlign: "right",
      marginBottom: 10,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.subText,
      textAlign: "right",
      marginBottom: 4,
      marginTop: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.inputBg,
      marginBottom: 8,
    },
    emailHint: {
      fontSize: 13,
      color: colors.subText,
      textAlign: "right",
      marginBottom: 10,
    },
    errorText: {
      fontSize: 13,
      color: colors.errorText,
      textAlign: "right",
      marginBottom: 8,
    },
    successText: {
      fontSize: 13,
      color: colors.primary,
      textAlign: "right",
      marginBottom: 8,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    primaryBtnText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: "700",
    },
    outlineBtn: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    outlineBtnText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "700",
    },
    btnDisabled: {
      opacity: 0.65,
    },
    legalLinks: {
      marginTop: 20,
      marginBottom: 24,
      gap: 8,
    },
    legalLinkBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    legalLinkText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      textAlign: "right",
    },
  });
