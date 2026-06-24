import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  IconBolt,
  IconChartBar,
  IconCircleCheck,
  IconFileText,
  IconPalette,
  IconRefresh,
  IconRocket,
  IconTarget,
  IconTrendingUp,
  IconWifi,
  IconWorld,
} from "@tabler/icons-react-native";
import { BRAND_NAME } from "../constants/brand";
import {
  LEARN_BENEFITS,
  LEARN_DYNAMIC_COMPARE,
  LEARN_HERO_POINTS,
  LEARN_HERO_STATS,
  LEARN_STATIC_COMPARE,
  LEARN_TIPS,
  LEARN_USE_CASES,
  LEARN_WORKFLOW_STEPS,
} from "../content/learnQrContent";
import ScreenWithAccessibility from "../components/ScreenWithAccessibility";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { useAccessibility } from "../context/AccessibilityContext";
import { row, rtlView, textStart } from "../utils/layout";

const USE_CASE_ICONS = {
  globe: IconWorld,
  wifi: IconWifi,
  file: IconFileText,
  trending: IconTrendingUp,
};

const HERO_POINT_ICONS = {
  bolt: IconBolt,
  refresh: IconRefresh,
  chart: IconChartBar,
};

const STEP_ICONS = {
  target: IconTarget,
  palette: IconPalette,
  rocket: IconRocket,
};

function BlockHead({ kicker, title, subtitle, styles }) {
  return (
    <View style={styles.blockHead}>
      <Text style={styles.kickerCenter}>{kicker}</Text>
      <Text style={styles.blockTitleCenter}>{title}</Text>
      {subtitle ? (
        <Text style={styles.blockSubtitleCenter}>{subtitle}</Text>
      ) : null}
      <View style={styles.titleAccent} />
    </View>
  );
}

function CheckRow({ text, styles, colors }) {
  return (
    <View style={styles.checkRow}>
      <IconCircleCheck size={18} color={colors.primary} strokeWidth={2.2} />
      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

function WorkflowTimeline({ steps, styles, colors }) {
  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[step.icon];
        const isLast = index === steps.length - 1;

        return (
          <View key={step.id} style={styles.timelineStep}>
            <View style={styles.timelineRail}>
              <LinearGradient
                colors={["#0a9396", "#087b7d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.timelineIconWrap}
              >
                <Icon size={20} color="#ffffff" strokeWidth={2} />
              </LinearGradient>
              {!isLast ? <View style={styles.timelineLine} /> : null}
            </View>

            <View style={styles.timelineContent}>
              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>שלב {index + 1}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function LearnQrScreen() {
  const navigation = useNavigation();
  const { colors, darkMode } = useAccessibility();
  const styles = useMemo(() => createStyles(colors, darkMode), [colors, darkMode]);

  const goCreate = () => {
    navigation.navigate("QrGenerator", { savedQrId: "new" });
  };

  return (
    <ScreenWithAccessibility>
      <View style={styles.pageInner}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ScreenPageHeader
            colors={colors}
            title="מה זה QR?"
            subtitle="מדריך קצר לעסקים ולמותגים — איך משתמשים נכון"
          />

          <View style={styles.heroCard}>
            <LinearGradient
              colors={
                darkMode
                  ? ["rgba(10,147,150,0.22)", "transparent"]
                  : ["rgba(10,147,150,0.12)", "transparent"]
              }
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.heroGradient}
            />
            <Text style={styles.heroLead}>
              QR הוא קיצור דרך חכם מהעולם הפיזי לדיגיטלי: סורקים עם מצלמה,
              ומגיעים מיד לעמוד, קובץ, טופס, WhatsApp, איש קשר או Wi-Fi בלי
              להקליד ובלי לאבד את המשתמש בדרך.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={goCreate}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>יצירת QR חדש</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroPanel}>
            <Text style={styles.panelKicker}>בשורה התחתונה</Text>
            <Text style={styles.panelTitle}>למה עסקים משתמשים ב־QR?</Text>
            {LEARN_HERO_POINTS.map((point) => {
              const Icon = HERO_POINT_ICONS[point.icon];
              return (
                <View key={point.id} style={styles.heroPointRow}>
                  <View style={styles.heroPointIconWrap}>
                    <Icon size={18} color={colors.primary} strokeWidth={2} />
                  </View>
                  <Text style={styles.heroPointText}>{point.text}</Text>
                </View>
              );
            })}
            <View style={styles.statGrid}>
              {LEARN_HERO_STATS.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statStrong}>{stat.strong}</Text>
                  <Text style={styles.statText}>{stat.text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.block}>
            <BlockHead
              kicker="שימושים נפוצים"
              title="איפה QR באמת חוסך זמן"
              subtitle="כשנותנים ללקוח מעבר ישיר לדבר הנכון, הסיכוי שהוא ימשיך לפעולה גדל משמעותית."
              styles={styles}
            />
            <View style={styles.useGrid}>
              {LEARN_USE_CASES.map((item) => {
                const Icon = USE_CASE_ICONS[item.icon];
                return (
                  <View key={item.id} style={styles.useCard}>
                    <View style={styles.cardIconWrap}>
                      <Icon size={22} color={colors.primary} strokeWidth={2} />
                    </View>
                    <View style={styles.useCardBody}>
                      <Text style={styles.useCardTitle}>{item.title}</Text>
                      <Text style={styles.useCardText}>{item.text}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <BlockHead
              kicker="איך זה עובד"
              title="שלושה שלבים פשוטים"
              subtitle="לא צריך לסבך את זה: בוחרים מטרה, מעצבים נכון, ומפרסמים."
              styles={styles}
            />
            <WorkflowTimeline
              steps={LEARN_WORKFLOW_STEPS}
              styles={styles}
              colors={colors}
            />
          </View>

          <View style={styles.block}>
            <BlockHead
              kicker="סטטי מול דינמי"
              title="מה מתאים לך?"
              subtitle="ההבדל פשוט: האם היעד נשאר קבוע, או שצריך גמישות ועדכון גם אחרי שהקוד כבר יצא החוצה?"
              styles={styles}
            />
            <View style={[styles.compareCard, styles.compareStatic]}>
              <View style={styles.compareAccent} />
              <View style={styles.compareInner}>
                <View style={styles.compareBadgeWrap}>
                  <Text style={styles.compareBadge}>
                    {LEARN_STATIC_COMPARE.badge}
                  </Text>
                </View>
                <Text style={styles.compareTitle}>
                  {LEARN_STATIC_COMPARE.title}
                </Text>
                <Text style={styles.compareText}>
                  {LEARN_STATIC_COMPARE.text}
                </Text>
                {LEARN_STATIC_COMPARE.items.map((item) => (
                  <CheckRow
                    key={item}
                    text={item}
                    styles={styles}
                    colors={colors}
                  />
                ))}
              </View>
            </View>
            <View style={[styles.compareCard, styles.compareDynamic]}>
              <View style={[styles.compareAccent, styles.compareAccentDynamic]} />
              <View style={styles.compareInner}>
                <View style={styles.compareBadgeWrap}>
                  <Text style={styles.compareBadge}>
                    {LEARN_DYNAMIC_COMPARE.badge}
                  </Text>
                </View>
                <Text style={styles.compareTitle}>
                  {LEARN_DYNAMIC_COMPARE.title}
                </Text>
                <Text style={styles.compareText}>
                  {LEARN_DYNAMIC_COMPARE.text}
                </Text>
                {LEARN_DYNAMIC_COMPARE.items.map((item) => (
                  <CheckRow
                    key={item}
                    text={item}
                    styles={styles}
                    colors={colors}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <BlockHead
              kicker="למה זה עובד טוב"
              title="מה QR נותן לעסק?"
              styles={styles}
            />
            {LEARN_BENEFITS.map((item) => (
              <CheckRow key={item} text={item} styles={styles} colors={colors} />
            ))}
          </View>

          <View style={styles.infoCard}>
            <BlockHead
              kicker="בחירה חכמה"
              title="איך לבחור נכון?"
              styles={styles}
            />
            {LEARN_TIPS.map((item) => (
              <CheckRow key={item} text={item} styles={styles} colors={colors} />
            ))}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.kickerCenter}>לסיכום</Text>
            <Text style={styles.summaryTitle}>
              QR טוב הוא לא רק יפה. הוא גם ברור, מהיר וקל לסריקה.
            </Text>
            <Text style={styles.summaryText}>
              כשמגדירים מטרה אחת ברורה, בוחרים בין סטטי לדינמי בצורה נכונה
              ומשאירים מעבר פשוט למשתמש, ה־QR הופך מכלי טכני לכלי שיווקי אמיתי.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={goCreate}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>להתחיל ליצור QR</Text>
            </TouchableOpacity>
            <Text style={styles.summaryBrand}>
              מעבר מהיר ל{BRAND_NAME}
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenWithAccessibility>
  );
}

const createStyles = (colors, darkMode) => {
  const cardShadow = darkMode
    ? {}
    : {
        shadowColor: "#0f172a",
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
      };

  return StyleSheet.create({
    pageInner: {
      flex: 1,
      ...rtlView,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 40,
      gap: 14,
      ...rtlView,
    },
    kickerCenter: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "center",
      letterSpacing: 0.6,
      marginBottom: 8,
      textTransform: "uppercase",
      writingDirection: "rtl",
    },
    blockHead: {
      marginBottom: 16,
      alignItems: "center",
      width: "100%",
    },
    blockTitleCenter: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      lineHeight: 28,
      writingDirection: "rtl",
    },
    blockSubtitleCenter: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.subText,
      textAlign: "center",
      marginTop: 8,
      writingDirection: "rtl",
      maxWidth: 320,
    },
    titleAccent: {
      width: 40,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.primary,
      marginTop: 12,
      opacity: 0.85,
    },
    heroCard: {
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 18,
      overflow: "hidden",
      ...cardShadow,
    },
    heroGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    heroLead: {
      fontSize: 16,
      lineHeight: 26,
      color: colors.subText,
      ...textStart,
      marginBottom: 16,
    },
    primaryBtn: {
      alignSelf: "center",
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 14,
      minWidth: 200,
      alignItems: "center",
    },
    primaryBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.white,
      textAlign: "center",
    },
    heroPanel: {
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: darkMode ? colors.card : "#f8fffe",
      padding: 18,
      ...cardShadow,
    },
    panelKicker: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
      ...textStart,
      letterSpacing: 0.6,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    panelTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      ...textStart,
      marginBottom: 12,
    },
    heroPointRow: {
      ...row,
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 10,
    },
    heroPointIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: darkMode
        ? "rgba(10, 147, 150, 0.18)"
        : "rgba(10, 147, 150, 0.1)",
      marginTop: 1,
    },
    heroPointText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 24,
      color: colors.subText,
      ...textStart,
    },
    statGrid: {
      ...row,
      gap: 10,
      marginTop: 10,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: darkMode ? colors.background : "rgba(255,255,255,0.8)",
      padding: 12,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
      ...textStart,
      letterSpacing: 0.5,
      marginBottom: 4,
      textTransform: "uppercase",
    },
    statStrong: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
      ...textStart,
    },
    statText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.subText,
      ...textStart,
      marginTop: 2,
    },
    block: {
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 18,
      ...cardShadow,
    },
    useGrid: {
      gap: 10,
    },
    useCard: {
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: darkMode ? colors.background : colors.card,
      padding: 14,
      ...row,
      alignItems: "flex-start",
      gap: 12,
    },
    cardIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: darkMode
        ? "rgba(20, 184, 166, 0.15)"
        : "rgba(10, 147, 150, 0.1)",
      flexShrink: 0,
    },
    useCardBody: {
      flex: 1,
    },
    useCardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      ...textStart,
      marginBottom: 4,
    },
    useCardText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.subText,
      ...textStart,
    },
    timeline: {
      paddingTop: 4,
    },
    timelineStep: {
      ...row,
      alignItems: "flex-start",
      gap: 12,
    },
    timelineRail: {
      width: 44,
      alignItems: "center",
      flexShrink: 0,
    },
    timelineIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    timelineLine: {
      width: 2,
      flex: 1,
      minHeight: 28,
      backgroundColor: "rgba(10, 147, 150, 0.28)",
      marginVertical: 6,
      borderRadius: 1,
    },
    timelineContent: {
      flex: 1,
      paddingBottom: 18,
    },
    stepPill: {
      alignSelf: "flex-start",
      backgroundColor: darkMode
        ? "rgba(10, 147, 150, 0.2)"
        : "rgba(10, 147, 150, 0.1)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: 6,
    },
    stepPillText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
      writingDirection: "rtl",
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      ...textStart,
      marginBottom: 4,
    },
    stepText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.subText,
      ...textStart,
    },
    compareCard: {
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginBottom: 10,
      overflow: "hidden",
      ...row,
      alignItems: "stretch",
    },
    compareStatic: {
      backgroundColor: darkMode
        ? colors.background
        : "rgba(241, 245, 249, 0.55)",
    },
    compareDynamic: {
      backgroundColor: darkMode
        ? colors.background
        : "rgba(240, 253, 250, 0.65)",
    },
    compareAccent: {
      width: 4,
      backgroundColor: "#94a3b8",
      borderRadius: 2,
    },
    compareAccentDynamic: {
      backgroundColor: colors.primary,
    },
    compareInner: {
      flex: 1,
      padding: 14,
    },
    compareBadgeWrap: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(10, 147, 150, 0.12)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: 8,
    },
    compareBadge: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "700",
      writingDirection: "rtl",
    },
    compareTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      ...textStart,
      marginBottom: 6,
    },
    compareText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.subText,
      ...textStart,
      marginBottom: 10,
    },
    checkRow: {
      ...row,
      alignItems: "flex-start",
      gap: 8,
      marginBottom: 8,
    },
    checkText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: colors.subText,
      ...textStart,
    },
    infoCard: {
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 18,
      ...cardShadow,
    },
    summaryCard: {
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 20,
      alignItems: "center",
      ...cardShadow,
    },
    summaryTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      lineHeight: 28,
      marginBottom: 10,
      writingDirection: "rtl",
    },
    summaryText: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.subText,
      ...textStart,
      marginBottom: 16,
      width: "100%",
    },
    summaryBrand: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      textAlign: "center",
    },
  });
};
