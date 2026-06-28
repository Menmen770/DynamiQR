import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  parseJsonResponse,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import AuthScreenLayout from "../components/auth/AuthScreenLayout";
import { createAuthUiStyles } from "../components/auth/authUi";

export default function VerifyEmailScreen({ navigation, route }) {
  const email = String(route?.params?.email || "").trim();
  const emailDelivery = route?.params?.emailDelivery || "smtp";
  const deliveryMessage = String(route?.params?.deliveryMessage || "").trim();
  const { refreshUser } = useAuth();
  const { colors } = useAccessibility();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const authStyles = useMemo(() => createAuthUiStyles(colors), [colors]);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleCodeChange = (value) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
    setError("");
    setSuccess("");
  };

  const handleVerify = async () => {
    if (!email) {
      setError("חסר אימייל — חזור להרשמה");
      return;
    }
    if (code.length !== 6) {
      setError("הזן קוד בן 6 ספרות");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/auth/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        },
        20000,
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data.error || "אימות נכשל");
      }
      await refreshUser(data.user, data.token);
    } catch (err) {
      if (err?.name === "AbortError") {
        setError("השרת לא הגיב בזמן");
      } else {
        setError(err.message || "אימות נכשל");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
        20000,
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data.error || "שליחה מחדש נכשלה");
      }
      setSuccess(data.message || "קוד חדש נשלח לאימייל");
      setCode("");
    } catch (err) {
      setError(err.message || "שליחה מחדש נכשלה");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthScreenLayout
      colors={colors}
      title="אימות אימייל"
      subtitle={
        emailDelivery === "smtp"
          ? "שלחנו קוד לכתובת שלך. המיil מגיע מ-dynamiqr@gmail.com (דינמיקר) — בדוק גם בתיקיית ספאם."
          : "שלחנו קוד בן 6 ספרות לכתובת שלך. הזן אותו כדי להשלים את ההרשמה."
      }
    >
      <View style={styles.emailBox}>
        <Text style={styles.emailLabel}>נשלח אל:</Text>
        <Text style={styles.emailValue} selectable>
          {email || "—"}
        </Text>
      </View>

      {emailDelivery === "console" ? (
        <View style={styles.devBanner}>
          <Text style={styles.devBannerText}>
            {deliveryMessage ||
              "SMTP לא מוגדר — המייל לא נשלח. הקוד מודפס בטרמינל של השרת (npm run dev)."}
          </Text>
        </View>
      ) : null}

      {emailDelivery === "failed" ? (
        <View style={authStyles.errorBanner}>
          <Text style={authStyles.errorText}>
            {deliveryMessage || "שליחת המייל נכשלה. לחץ 'שלח קוד מחדש'."}
          </Text>
        </View>
      ) : null}

      {error ? (
        <View style={authStyles.errorBanner}>
          <Text style={authStyles.errorText}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      <Text style={styles.fieldLabel}>קוד אימות</Text>
      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={handleCodeChange}
        placeholder="000000"
        placeholderTextColor={colors.subText}
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
        autoComplete="one-time-code"
      />

      <TouchableOpacity
        style={[authStyles.submitButton, loading && authStyles.submitButtonDisabled]}
        onPress={handleVerify}
        disabled={loading}
        activeOpacity={0.88}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={authStyles.submitButtonText}>אמת והמשך</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.resendBtn, resending && styles.resendDisabled]}
        onPress={handleResend}
        disabled={resending || !email}
      >
        {resending ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={styles.resendText}>שלח קוד מחדש</Text>
        )}
      </TouchableOpacity>

      <View style={authStyles.footerRow}>
        <Text style={authStyles.footerText}>טעית באימייל?</Text>
        <TouchableOpacity onPress={() => navigation.replace("Register")}>
          <Text style={authStyles.footerLink}>חזרה להרשמה</Text>
        </TouchableOpacity>
      </View>
    </AuthScreenLayout>
  );
}

const createStyles = (colors) => ({
  emailBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  emailLabel: {
    fontSize: 13,
    color: colors.subText,
    textAlign: "right",
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    textAlign: "right",
    writingDirection: "ltr",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "right",
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 12,
    color: colors.text,
    backgroundColor: colors.inputBg,
    marginBottom: 16,
    writingDirection: "ltr",
  },
  successBanner: {
    backgroundColor: colors.primarySoft || `${colors.primary}18`,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  successText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  devBanner: {
    backgroundColor: colors.warningBg || "#fff8e6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.warningBorder || "#f0d78c",
  },
  devBannerText: {
    color: colors.warningText || "#8a6d00",
    fontSize: 13,
    textAlign: "right",
    lineHeight: 19,
  },
  resendBtn: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  resendDisabled: {
    opacity: 0.65,
  },
  resendText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
