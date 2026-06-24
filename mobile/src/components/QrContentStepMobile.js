import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

function Field({ label, hint, children, colors, styles }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export default function QrContentStepMobile({
  colors,
  qrType,
  qrInputs,
  onInputChange,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  const inputProps = {
    style: styles.input,
    textAlign: "right",
    placeholderTextColor: colors.subText,
  };

  if (qrType === "url") {
    return (
      <Field label="כתובת (URL)" hint="הקישור שיפתח בסריקה" colors={colors} styles={styles}>
        <TextInput
          {...inputProps}
          value={qrInputs.url}
          onChangeText={(t) => onInputChange("url", t)}
          placeholder="https://example.com"
          autoCapitalize="none"
          keyboardType="url"
        />
      </Field>
    );
  }

  if (qrType === "pdf") {
    return (
      <Field label="קישור ל-PDF" hint="הדבק URL של קובץ PDF" colors={colors} styles={styles}>
        <TextInput
          {...inputProps}
          value={qrInputs.pdf}
          onChangeText={(t) => onInputChange("pdf", t)}
          placeholder="https://example.com/document.pdf"
          autoCapitalize="none"
          keyboardType="url"
        />
      </Field>
    );
  }

  if (qrType === "whatsapp") {
    return (
      <>
        <Field label="מספר טלפון" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.whatsapp.phone}
            onChangeText={(t) => onInputChange("whatsapp.phone", t)}
            placeholder="+972 50 123 4567"
            keyboardType="phone-pad"
          />
        </Field>
        <Field label="הודעה (אופציונלי)" hint="פותח שיחת WhatsApp" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.whatsapp.message}
            onChangeText={(t) => onInputChange("whatsapp.message", t)}
            placeholder="שלום, אשמח לשמוע ממך..."
            multiline
          />
        </Field>
      </>
    );
  }

  if (qrType === "email") {
    return (
      <>
        <Field label="כתובת אימייל" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.email.email}
            onChangeText={(t) => onInputChange("email.email", t)}
            placeholder="you@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Field>
        <Field label="נושא (אופציונלי)" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.email.subject}
            onChangeText={(t) => onInputChange("email.subject", t)}
            placeholder="נושא האימייל"
          />
        </Field>
        <Field label="הודעה (אופציונלי)" hint="פותח אפליקציית אימייל" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.email.message}
            onChangeText={(t) => onInputChange("email.message", t)}
            placeholder="תוכן האימייל..."
            multiline
          />
        </Field>
      </>
    );
  }

  if (qrType === "phone") {
    return (
      <Field label="מספר טלפון" hint="חיוג ישיר בסריקה" colors={colors} styles={styles}>
        <TextInput
          {...inputProps}
          value={qrInputs.phone}
          onChangeText={(t) => onInputChange("phone", t)}
          placeholder="+972 50 123 4567"
          keyboardType="phone-pad"
        />
      </Field>
    );
  }

  if (qrType === "sms") {
    return (
      <>
        <Field label="מספר טלפון" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.sms.phone}
            onChangeText={(t) => onInputChange("sms.phone", t)}
            placeholder="+972 50 123 4567"
            keyboardType="phone-pad"
          />
        </Field>
        <Field label="הודעה" hint="פותח אפליקציית SMS" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.sms.message}
            onChangeText={(t) => onInputChange("sms.message", t)}
            placeholder="תוכן ההודעה..."
            multiline
          />
        </Field>
      </>
    );
  }

  if (qrType === "wifi") {
    return (
      <>
        <Field label="שם הרשת (SSID)" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.wifi.ssid}
            onChangeText={(t) => onInputChange("wifi.ssid", t)}
            placeholder="MyWiFi"
          />
        </Field>
        <Field label="סיסמה" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.wifi.password}
            onChangeText={(t) => onInputChange("wifi.password", t)}
            placeholder="סיסמת WiFi"
          />
        </Field>
        <Field label="סוג אבטחה" hint="התחברות אוטומטית ל-WiFi" colors={colors} styles={styles}>
          <View style={styles.segmentRow}>
            {[
              { id: "WPA", label: "WPA" },
              { id: "WEP", label: "WEP" },
              { id: "nopass", label: "פתוח" },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => onInputChange("wifi.security", opt.id)}
                style={[
                  styles.segmentChip,
                  qrInputs.wifi.security === opt.id && styles.segmentChipOn,
                ]}
              >
                <Text
                  style={[
                    styles.segmentChipText,
                    qrInputs.wifi.security === opt.id && styles.segmentChipTextOn,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
      </>
    );
  }

  if (qrType === "contact") {
    return (
      <>
        <Field label="שם מלא" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.contact.name}
            onChangeText={(t) => onInputChange("contact.name", t)}
            placeholder="ישראל ישראלי"
          />
        </Field>
        <Field label="טלפון" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.contact.phone}
            onChangeText={(t) => onInputChange("contact.phone", t)}
            placeholder="+972 50 123 4567"
            keyboardType="phone-pad"
          />
        </Field>
        <Field label="אימייל" hint="שמירה כ-vCard" colors={colors} styles={styles}>
          <TextInput
            {...inputProps}
            value={qrInputs.contact.email}
            onChangeText={(t) => onInputChange("contact.email", t)}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Field>
      </>
    );
  }

  const socialMap = {
    facebook: { label: "שם משתמש בפייסבוק", key: "facebook", hint: "קישור לפרופיל" },
    instagram: { label: "שם משתמש באינסטגרם", key: "instagram", hint: "קישור לפרופיל" },
    twitter: { label: "שם משתמש ב-X", key: "twitter", hint: "קישור לפרופיל" },
    linkedin: { label: "שם משתמש בלינקדאין", key: "linkedin", hint: "קישור לפרופיל" },
    youtube: { label: "מזהה YouTube", key: "youtube", hint: "קישור לערוץ" },
    tiktok: { label: "שם משתמש בטיקטוק", key: "tiktok", hint: "קישור לפרופיל" },
  };

  const social = socialMap[qrType];
  if (social) {
    return (
      <Field label={social.label} hint={social.hint} colors={colors} styles={styles}>
        <TextInput
          {...inputProps}
          value={qrInputs[social.key]}
          onChangeText={(t) => onInputChange(social.key, t)}
          placeholder="username"
          autoCapitalize="none"
        />
      </Field>
    );
  }

  return null;
}

const createStyles = (colors) =>
  StyleSheet.create({
    field: {
      marginBottom: 14,
    },
    label: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      textAlign: "right",
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.inputBg,
      fontSize: 15,
      color: colors.text,
      minHeight: 44,
    },
    hint: {
      fontSize: 12,
      color: colors.subText,
      textAlign: "right",
      marginTop: 6,
    },
    segmentRow: {
      flexDirection: "row",
      gap: 8,
    },
    segmentChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    segmentChipOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    segmentChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
    segmentChipTextOn: {
      color: colors.white,
    },
  });
