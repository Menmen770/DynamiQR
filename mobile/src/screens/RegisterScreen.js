import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Text,
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
import AuthTextField from "../components/auth/AuthTextField";
import AuthPasswordField from "../components/auth/AuthPasswordField";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import AuthLegalFooter from "../components/auth/AuthLegalFooter";
import { createAuthUiStyles } from "../components/auth/authUi";

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isPasswordValid = (password) => {
  if (password.length < 7) return false;
  if (!/^[\p{L}\p{N}]+$/u.test(password)) return false;
  if (!/\p{L}/u.test(password)) return false;
  if (!/\p{N}/u.test(password)) return false;
  return true;
};

export default function RegisterScreen({ navigation }) {
  const { refreshUser } = useAuth();
  const { colors } = useAccessibility();
  const styles = useMemo(() => createAuthUiStyles(colors), [colors]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid = () =>
    form.fullName.trim().length >= 2 &&
    isEmailValid(form.email) &&
    isPasswordValid(form.password);

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError("נא למלא את כל השדות בצורה תקינה");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
          }),
        },
        20000,
      );

      const data = await parseJsonResponse(response);
      if (!response.ok && !data?.needsEmailVerification) {
        throw new Error(data.error || "ההרשמה נכשלה");
      }

      if (data.needsEmailVerification) {
        navigation.replace("VerifyEmail", {
          email: data.email || form.email,
          emailDelivery: data.emailDelivery || "smtp",
          deliveryMessage: data.message || "",
        });
        return;
      }

      await refreshUser(data.user, data.token);
    } catch (err) {
      if (err?.name === "AbortError") {
        setError(
          "השרת לא הגיב בזמן. ודא שה-backend רץ והגדר EXPO_PUBLIC_API_URL ב-.env",
        );
      } else {
        setError(err.message || "ההרשמה נכשלה");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      colors={colors}
      title="יצירת חשבון"
      subtitle="הצטרף לדינמיקר וצור קודי QR בעיצוב אישי"
    >
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.fields}>
        <AuthTextField
          colors={colors}
          value={form.fullName}
          onChangeText={(t) => handleChange("fullName", t)}
          onBlur={() => handleBlur("fullName")}
          placeholder="שם מלא"
          invalid={touched.fullName && form.fullName.trim().length < 2}
          autoCapitalize="words"
        />
        {touched.fullName && form.fullName.trim().length < 2 ? (
          <Text style={styles.validationText}>יש להזין לפחות 2 תווים</Text>
        ) : null}

        <AuthTextField
          colors={colors}
          value={form.email}
          onChangeText={(t) => handleChange("email", t)}
          onBlur={() => handleBlur("email")}
          placeholder="כתובת אימייל"
          invalid={touched.email && !isEmailValid(form.email)}
          keyboardType="email-address"
        />
        {touched.email && !isEmailValid(form.email) ? (
          <Text style={styles.validationText}>נא להזין אימייל תקין</Text>
        ) : null}

        <AuthPasswordField
          colors={colors}
          value={form.password}
          onChangeText={(t) => handleChange("password", t)}
          onBlur={() => handleBlur("password")}
          placeholder="סיסמה"
          invalid={touched.password && !isPasswordValid(form.password)}
          showPassword={showPassword}
          onToggleShow={() => setShowPassword((p) => !p)}
        />
        {touched.password && !isPasswordValid(form.password) ? (
          <Text style={styles.validationText}>
            לפחות 7 תווים, אותיות ומספרים בלבד
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.88}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>יצירת חשבון</Text>
        )}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>או</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton
        colors={colors}
        label="הרשמה עם Google"
        onPress={() => Linking.openURL(`${getApiBaseUrl()}/api/auth/google`)}
      />

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>כבר יש לך חשבון?</Text>
        <TouchableOpacity onPress={() => navigation.replace("Login")}>
          <Text style={styles.footerLink}>התחברות</Text>
        </TouchableOpacity>
      </View>

      <AuthLegalFooter styles={styles} navigation={navigation} />
    </AuthScreenLayout>
  );
}
