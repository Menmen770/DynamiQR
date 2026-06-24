import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  IconFolder,
  IconLayoutGrid,
  IconPlus,
  IconTrash,
  IconUser,
} from "@tabler/icons-react-native";
import { UNFILED_ORDER_KEY } from "../../utils/dashboardFoldersStorageMobile";

const ACTIVITY_FILTERS = [
  { id: "all", label: "הכל" },
  { id: "active", label: "פעילים" },
  { id: "inactive", label: "לא פעילים" },
];

export default function MyCodesFolderSheet({
  visible,
  onClose,
  colors,
  folders,
  selectedViewId,
  onSelectView,
  counts,
  activityFilter,
  onActivityFilterChange,
  onCreateFolder,
  onDeleteFolder,
  onOpenAccount,
  accountActive,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>סינון ותיקיות</Text>

          <Text style={styles.sectionLabel}>מצב פעיל</Text>
          <View style={styles.chipRow}>
            {ACTIVITY_FILTERS.map(({ id, label }) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.chip,
                  activityFilter === id && styles.chipActive,
                ]}
                onPress={() => onActivityFilterChange(id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    activityFilter === id && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>תצוגה</Text>
          <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
            <NavItem
              styles={styles}
              active={selectedViewId === "all"}
              icon={<IconLayoutGrid size={18} color={colors.subText} />}
              label="קודים פעילים"
              count={counts.activeCodes ?? counts.all}
              onPress={() => {
                onSelectView("all");
                onClose();
              }}
            />
            <NavItem
              styles={styles}
              active={selectedViewId === UNFILED_ORDER_KEY}
              label="ללא תיקייה"
              count={counts.unfiled}
              onPress={() => {
                onSelectView(UNFILED_ORDER_KEY);
                onClose();
              }}
            />
            {folders.map((f) => (
              <View key={f.id} style={styles.folderRow}>
                <NavItem
                  styles={styles}
                  active={selectedViewId === f.id}
                  icon={<IconFolder size={18} color={colors.subText} />}
                  label={f.name}
                  count={counts.perFolder[f.id] ?? 0}
                  onPress={() => {
                    onSelectView(f.id);
                    onClose();
                  }}
                />
                <TouchableOpacity
                  style={styles.deleteFolderBtn}
                  onPress={() => onDeleteFolder(f.id, f.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <IconTrash size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.outlineBtn} onPress={onCreateFolder}>
            <IconPlus size={18} color={colors.text} />
            <Text style={styles.outlineBtnText}>צור תיקייה</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineBtn, accountActive && styles.outlineBtnActive]}
            onPress={() => {
              onOpenAccount();
              onClose();
            }}
          >
            <IconUser size={18} color={accountActive ? colors.white : colors.text} />
            <Text
              style={[
                styles.outlineBtnText,
                accountActive && styles.outlineBtnTextActive,
              ]}
            >
              עדכון פרטים
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function NavItem({ styles, active, icon, label, count, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
        {label}
      </Text>
      <View style={[styles.countBadge, active && styles.countBadgeActive]}>
        <Text style={[styles.countText, active && styles.countTextActive]}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingBottom: 28,
      maxHeight: "82%",
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: 10,
      marginBottom: 14,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
      marginBottom: 16,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.subText,
      textAlign: "right",
      marginBottom: 8,
      marginTop: 4,
    },
    chipRow: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    chipTextActive: {
      color: colors.white,
    },
    navScroll: {
      maxHeight: 220,
      marginBottom: 12,
    },
    navItem: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginBottom: 4,
    },
    navItemActive: {
      backgroundColor: `${colors.primary}22`,
    },
    navLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      textAlign: "right",
    },
    navLabelActive: {
      color: colors.primary,
      fontWeight: "800",
    },
    countBadge: {
      minWidth: 26,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: colors.background,
      alignItems: "center",
    },
    countBadgeActive: {
      backgroundColor: colors.primary,
    },
    countText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.subText,
    },
    countTextActive: {
      color: colors.white,
    },
    folderRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
    },
    deleteFolderBtn: {
      padding: 8,
      marginRight: 4,
    },
    outlineBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
    outlineBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    outlineBtnText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    outlineBtnTextActive: {
      color: colors.white,
    },
  });
