import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  IconBrandAndroid,
  IconBrandApple,
  IconChartBar,
  IconDeviceMobile,
  IconX,
} from "@tabler/icons-react-native";
import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  parseJsonResponse,
} from "../../utils/api";
import { cardTitle } from "../../utils/savedQrHelpersMobile";

function percentOf(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

const OS_ICONS = {
  ios: IconBrandApple,
  android: IconBrandAndroid,
  other: IconDeviceMobile,
};

export default function SavedQrStatsModal({ visible, onClose, colors, row }) {
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * 0.92);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!visible || !row?._id || row.linkMode !== "dynamic") return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiFetchWithTimeout(
          `${getApiBaseUrl()}/api/saved-qrs/${row._id}/stats`,
          { method: "GET" },
          20000,
        );
        const data = await parseJsonResponse(response);
        if (!response.ok) {
          throw new Error(data?.error || "טעינת סטטיסטיקות נכשלה");
        }
        if (!cancelled) setStats(data || null);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "טעינה נכשלה");
          setStats(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, row?._id, row?.linkMode]);

  const totalScans = Number(stats?.totalScans || 0);
  const osItems = useMemo(() => {
    const items = [
      { key: "ios", label: "iPhone (iOS)", count: 0 },
      { key: "android", label: "Android", count: 0 },
      { key: "other", label: "אחר", count: 0 },
    ];
    for (const it of stats?.osBreakdown || []) {
      const found = items.find((x) => x.key === it.key);
      if (found) found.count = Number(it.count || 0);
    }
    return [...items].sort((a, b) => b.count - a.count);
  }, [stats]);

  const countryItems = stats?.countryBreakdown || [];
  const dailySeries = Array.isArray(stats?.dailySeries) ? stats.dailySeries : [];
  const maxDaily = Math.max(0, ...dailySeries.map((d) => Number(d.count || 0)));
  const last30Total = dailySeries.reduce(
    (sum, d) => sum + Number(d.count || 0),
    0,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { height: sheetHeight }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerIconWrap}>
              <IconChartBar size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>סטטיסטיקות לקוד</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {cardTitle(row)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeIconBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="סגירה"
            >
              <IconX size={22} color={colors.subText} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces
          >
            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.muted}>טוען נתונים…</Text>
              </View>
            ) : error ? (
              <View style={styles.errorBox}>
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : (
              <>
                <View style={styles.hero}>
                  <Text style={styles.heroValue}>
                    {totalScans.toLocaleString("he-IL")}
                  </Text>
                  <Text style={styles.heroLabel}>סה״כ סריקות</Text>
                  {last30Total > 0 ? (
                    <Text style={styles.heroSub}>
                      {last30Total.toLocaleString("he-IL")} ב־30 הימים האחרונים
                    </Text>
                  ) : null}
                </View>

                {totalScans === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.hint}>
                      אין עדיין סריקות. אחרי שמישהו יסרוק את הקוד יופיעו כאן
                      פילוח מערכות הפעלה, מדינות וגרף לפי ימים.
                    </Text>
                  </View>
                ) : (
                  <>
                    <StatSection styles={styles} title="לפי מערכת הפעלה">
                      {osItems.map((it) => {
                        const pct = percentOf(it.count, totalScans);
                        const OsIcon = OS_ICONS[it.key] || IconDeviceMobile;
                        return (
                          <BarRow
                            key={it.key}
                            styles={styles}
                            label={it.label}
                            count={it.count}
                            pct={pct}
                            icon={
                              <OsIcon
                                size={18}
                                color={colors.primary}
                                strokeWidth={1.8}
                              />
                            }
                          />
                        );
                      })}
                    </StatSection>

                    <StatSection styles={styles} title="מדינות מובילות">
                      {countryItems.length === 0 ? (
                        <Text style={styles.mutedInline}>
                          עדיין אין נתוני מדינה
                        </Text>
                      ) : (
                        countryItems.slice(0, 8).map((it, idx) => {
                          const pct = percentOf(it.count, totalScans);
                          const name =
                            it.label && !/^[A-Za-z]{2}$/.test(it.label)
                              ? it.label
                              : it.code || "—";
                          return (
                            <BarRow
                              key={`${it.code}-${idx}`}
                              styles={styles}
                              label={`${idx + 1}. ${name}`}
                              count={it.count}
                              pct={pct}
                            />
                          );
                        })
                      )}
                    </StatSection>

                    <StatSection
                      styles={styles}
                      title="30 הימים האחרונים"
                      subtitle="גלול הצידה לצפייה בכל הימים"
                    >
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chartScroll}
                      >
                        {dailySeries.map((d) => {
                          const c = Number(d.count || 0);
                          const h =
                            maxDaily === 0
                              ? 6
                              : Math.max(6, (c / maxDaily) * 88);
                          const dayLabel = formatDay(d.date);
                          return (
                            <View key={d.date} style={styles.barCol}>
                              <Text style={styles.barCount}>
                                {c > 0 ? c : ""}
                              </Text>
                              <View style={[styles.bar, { height: h }]} />
                              <Text style={styles.barLabel}>{dayLabel}</Text>
                            </View>
                          );
                        })}
                      </ScrollView>
                    </StatSection>
                  </>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>סגירה</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function StatSection({ styles, title, subtitle, children }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? (
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
}

function BarRow({ styles, label, count, pct, icon }) {
  const fillWidth = Math.max(pct, count > 0 ? 6 : 0);
  return (
    <View style={styles.barRow}>
      <View style={styles.barRowHeader}>
        <View style={styles.barRowLabelWrap}>
          {icon ? <View style={styles.barRowIcon}>{icon}</View> : null}
          <Text style={styles.barRowLabel} numberOfLines={2}>
            {label}
          </Text>
        </View>
        <Text style={styles.barMetric}>
          {count.toLocaleString("he-IL")} ({pct}%)
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${fillWidth}%` }]} />
      </View>
    </View>
  );
}

function formatDay(dayKey) {
  if (!dayKey) return "";
  const m = dayKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return dayKey;
  return `${Number(m[3])}.${Number(m[2])}`;
}

const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingBottom: 12,
      overflow: "hidden",
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 999,
      backgroundColor: colors.border,
      marginTop: 10,
      marginBottom: 12,
    },
    header: {
      flexDirection: "row-reverse",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 16,
      paddingBottom: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.primary}18`,
    },
    headerText: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
    },
    subtitle: {
      fontSize: 14,
      color: colors.subText,
      textAlign: "right",
      marginTop: 4,
      lineHeight: 20,
    },
    closeIconBtn: {
      padding: 4,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 8,
      gap: 14,
    },
    center: {
      alignItems: "center",
      paddingVertical: 48,
      gap: 14,
    },
    muted: {
      fontSize: 16,
      color: colors.subText,
      textAlign: "center",
    },
    mutedInline: {
      fontSize: 15,
      color: colors.subText,
      textAlign: "right",
      lineHeight: 22,
    },
    errorBox: {
      padding: 16,
      borderRadius: 14,
      backgroundColor: `${colors.error || "#dc2626"}14`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.error || "#dc2626"}44`,
    },
    error: {
      fontSize: 15,
      color: colors.errorText || colors.error || "#dc2626",
      textAlign: "right",
      lineHeight: 22,
    },
    hero: {
      alignItems: "center",
      paddingVertical: 22,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: `${colors.primary}14`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.primary}33`,
    },
    heroValue: {
      fontSize: 42,
      fontWeight: "800",
      color: colors.primary,
      lineHeight: 48,
    },
    heroLabel: {
      fontSize: 17,
      color: colors.text,
      fontWeight: "700",
      marginTop: 4,
    },
    heroSub: {
      fontSize: 14,
      color: colors.subText,
      marginTop: 8,
      textAlign: "center",
    },
    emptyBox: {
      padding: 18,
      borderRadius: 14,
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    hint: {
      fontSize: 15,
      color: colors.subText,
      textAlign: "right",
      lineHeight: 24,
    },
    sectionCard: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.subText,
      textAlign: "right",
      marginTop: -6,
    },
    barRow: {
      gap: 8,
    },
    barRowHeader: {
      flexDirection: "row-reverse",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },
    barRowLabelWrap: {
      flex: 1,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      minWidth: 0,
    },
    barRowIcon: {
      flexShrink: 0,
    },
    barRowLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      textAlign: "right",
      lineHeight: 21,
    },
    barTrack: {
      height: 12,
      borderRadius: 999,
      backgroundColor: colors.card,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    barFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 999,
    },
    barMetric: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "left",
      flexShrink: 0,
      minWidth: 72,
    },
    chartScroll: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      paddingTop: 8,
      paddingBottom: 4,
      paddingHorizontal: 2,
      minHeight: 130,
    },
    barCol: {
      width: 34,
      alignItems: "center",
      justifyContent: "flex-end",
      minHeight: 118,
    },
    bar: {
      width: 22,
      backgroundColor: colors.primary,
      borderRadius: 6,
      minHeight: 6,
    },
    barCount: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
      minHeight: 14,
      textAlign: "center",
    },
    barLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.subText,
      marginTop: 6,
      textAlign: "center",
    },
    footer: {
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    closeBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    closeBtnText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "700",
    },
  });
