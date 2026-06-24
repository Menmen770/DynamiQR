import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  IconAdjustments,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react-native";
import ScreenWithAccessibility from "../components/ScreenWithAccessibility";
import ScreenPageHeader from "../components/ScreenPageHeader";
import SavedQrCardMobile from "../components/myCodes/SavedQrCardMobile";
import MyCodesFolderSheet from "../components/myCodes/MyCodesFolderSheet";
import MyCodesAccountPanel from "../components/myCodes/MyCodesAccountPanel";
import SimplePromptModal from "../components/myCodes/SimplePromptModal";
import { useAccessibility } from "../context/AccessibilityContext";
import { useAuth } from "../context/AuthContext";
import { BRAND_NAME } from "../constants/brand";
import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  parseJsonResponse,
} from "../utils/api";
import {
  assignQrToFolder,
  createFolder,
  deleteFolder,
  folderCounts,
  getOrderedQrIds,
  isFolderStateMeaningful,
  loadFolderState,
  pruneQrFromFolderState,
  saveFolderState,
  syncFolderStateWithItems,
  UNFILED_ORDER_KEY,
} from "../utils/dashboardFoldersStorageMobile";
import {
  fetchDashboardFoldersState,
  putDashboardFoldersState,
} from "../utils/dashboardFoldersApiMobile";
import { buildLoadPayload } from "../utils/savedQrHelpersMobile";

const ACTIVITY_LABELS = {
  all: "הכל",
  active: "פעילים",
  inactive: "לא פעילים",
};

const VIEW_LABELS = {
  all: "קודים פעילים",
  [UNFILED_ORDER_KEY]: "ללא תיקייה",
};

export default function MyCodesScreen() {
  const navigation = useNavigation();
  const { colors } = useAccessibility();
  const { setUser } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const noticeTimerRef = useRef(null);
  const remoteFolderTimerRef = useRef(null);
  const pendingFolderStateRef = useRef(null);

  const [folderState, setFolderState] = useState({
    folders: [],
    assignments: {},
    globalOrder: [],
    folderOrders: {},
  });
  const [folderSyncEpoch, setFolderSyncEpoch] = useState(0);
  const [selectedViewId, setSelectedViewId] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [debouncedNameSearch, setDebouncedNameSearch] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);

  const persistFolderState = useCallback((next) => {
    saveFolderState(next);
    pendingFolderStateRef.current = next;
    if (remoteFolderTimerRef.current) {
      clearTimeout(remoteFolderTimerRef.current);
    }
    remoteFolderTimerRef.current = setTimeout(() => {
      remoteFolderTimerRef.current = null;
      const payload = pendingFolderStateRef.current;
      pendingFolderStateRef.current = null;
      if (payload) {
        void putDashboardFoldersState(payload).catch(() => {});
      }
    }, 550);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedNameSearch(nameSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [nameSearch]);

  useEffect(
    () => () => {
      if (remoteFolderTimerRef.current) {
        clearTimeout(remoteFolderTimerRef.current);
        remoteFolderTimerRef.current = null;
      }
      const payload = pendingFolderStateRef.current;
      pendingFolderStateRef.current = null;
      if (payload) {
        void putDashboardFoldersState(payload).catch(() => {});
      }
    },
    [],
  );

  const showNotice = useCallback((message) => {
    setNotice(message);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 4500);
  }, []);

  const fetchSavedQrList = useCallback(async () => {
    const qs = new URLSearchParams();
    qs.set("limit", "50");
    if (debouncedNameSearch) qs.set("q", debouncedNameSearch);
    const response = await apiFetchWithTimeout(
      `${getApiBaseUrl()}/api/saved-qrs?${qs.toString()}`,
      { method: "GET" },
      20000,
    );
    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data?.error || "טעינה נכשלה");
    }
    return Array.isArray(data.items) ? data.items : [];
  }, [debouncedNameSearch]);

  const loadList = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const list = await fetchSavedQrList();
      setItems(list);
    } catch (err) {
      setError(err.message || "טעינה נכשלה");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchSavedQrList]);

  useFocusEffect(
    useCallback(() => {
      loadList();
    }, [loadList]),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = await loadFolderState();
      if (!cancelled) setFolderState(local);

      const remote = await fetchDashboardFoldersState();
      if (cancelled) return;
      if (!remote.ok) {
        if (!remote.unauthorized && remote.error) showNotice(remote.error);
        setFolderSyncEpoch((e) => e + 1);
        return;
      }
      const serverState = remote.state;
      const localState = await loadFolderState();
      if (isFolderStateMeaningful(serverState)) {
        setFolderState(serverState);
        await saveFolderState(serverState);
      } else if (isFolderStateMeaningful(localState)) {
        setFolderState(localState);
        await saveFolderState(localState);
        const put = await putDashboardFoldersState(localState);
        if (!put.ok && put.error) showNotice(put.error);
      }
      setFolderSyncEpoch((e) => e + 1);
    })();
    return () => {
      cancelled = true;
    };
  }, [showNotice]);

  useEffect(() => {
    if (loading) return;
    setFolderState((prev) => {
      const synced = syncFolderStateWithItems(items, prev);
      persistFolderState(synced);
      return synced;
    });
  }, [items, loading, folderSyncEpoch, persistFolderState]);

  const filteredItems = useMemo(() => {
    if (activityFilter === "all") return items;
    return items.filter((r) => {
      const active = r.isActive !== false;
      return activityFilter === "active" ? active : !active;
    });
  }, [items, activityFilter]);

  const counts = useMemo(() => {
    const base = folderCounts(filteredItems, folderState);
    return {
      ...base,
      activeCodes: filteredItems.filter((r) => r.isActive !== false).length,
    };
  }, [filteredItems, folderState]);

  const viewScopedItems = useMemo(() => {
    if (selectedViewId !== "all") return filteredItems;
    return filteredItems.filter((r) => r.isActive !== false);
  }, [filteredItems, selectedViewId]);

  const displayItems = useMemo(() => {
    const ids = getOrderedQrIds(viewScopedItems, selectedViewId, folderState);
    const byId = Object.fromEntries(
      viewScopedItems.map((r) => [String(r._id), r]),
    );
    return ids.map((id) => byId[id]).filter(Boolean);
  }, [viewScopedItems, selectedViewId, folderState]);

  const currentViewLabel = useMemo(() => {
    if (selectedViewId === "all") return VIEW_LABELS.all;
    if (selectedViewId === UNFILED_ORDER_KEY) return VIEW_LABELS[UNFILED_ORDER_KEY];
    const f = folderState.folders.find((x) => x.id === selectedViewId);
    return f?.name || "תיקייה";
  }, [selectedViewId, folderState.folders]);

  const renderCardSeparator = useCallback(
    () => (
      <View style={styles.cardDivider} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.cardDividerLine} />
        <View style={styles.cardDividerDot} />
        <View style={styles.cardDividerLine} />
      </View>
    ),
    [styles],
  );

  const openInEditor = useCallback(
    (row) => {
      navigation.navigate("QrGenerator", {
        savedQrId: row._id,
        loadPayload: buildLoadPayload(row),
      });
    },
    [navigation],
  );

  const handleSavedQrFromApi = useCallback((saved) => {
    if (!saved?._id) return;
    setItems((prev) =>
      prev.map((r) =>
        String(r._id) === String(saved._id) ? { ...r, ...saved } : r,
      ),
    );
  }, []);

  const handleAssignFolder = useCallback(
    (qrId, folderIdOrNull) => {
      setFolderState((prev) => {
        const next = assignQrToFolder(prev, qrId, folderIdOrNull);
        persistFolderState(next);
        return next;
      });
    },
    [persistFolderState],
  );

  const handleDelete = useCallback(
    (id) => {
      setItems((prev) => prev.filter((r) => r._id !== id));
      setFolderState((prev) => {
        const next = pruneQrFromFolderState(prev, id);
        persistFolderState(next);
        return next;
      });
    },
    [persistFolderState],
  );

  const handleCreateFolderWithName = useCallback(
    (name) => {
      const trimmed = String(name || "").trim();
      if (!trimmed) {
        showNotice("שם התיקייה לא יכול להיות ריק.");
        return false;
      }
      setFolderState((prev) => {
        const next = createFolder(prev, trimmed);
        persistFolderState(next);
        return next;
      });
      return true;
    },
    [showNotice, persistFolderState],
  );

  const handleDeleteFolder = useCallback(
    (folderId, folderName) => {
      Alert.alert(
        "מחיקת תיקייה",
        `למחוק את התיקייה "${folderName}"? הקודים שבה יעברו ל«ללא תיקייה».`,
        [
          { text: "ביטול", style: "cancel" },
          {
            text: "מחק",
            style: "destructive",
            onPress: () => {
              setFolderState((prev) => {
                const next = deleteFolder(prev, folderId);
                persistFolderState(next);
                return next;
              });
              setSelectedViewId((v) => (v === folderId ? "all" : v));
            },
          },
        ],
      );
    },
    [persistFolderState],
  );

  const folderNameForRow = useCallback(
    (row) => {
      const fid = folderState.assignments[String(row._id)];
      if (!fid) return "ללא תיקייה";
      const f = folderState.folders.find((x) => x.id === fid);
      return f?.name || "תיקייה";
    },
    [folderState.assignments, folderState.folders],
  );

  const openCreate = () => {
    navigation.navigate("QrGenerator", { savedQrId: "new" });
  };

  const renderEmpty = () => {
    if (loading) return null;
    if (items.length === 0) {
      if (debouncedNameSearch) {
        return (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>לא נמצאו קודים בשם הזה</Text>
            <Text style={styles.emptyText}>
              נסו מילה אחרת או נקו את החיפוש כדי לראות את כל הקודים.
            </Text>
            <TouchableOpacity
              style={styles.emptyOutlineBtn}
              onPress={() => setNameSearch("")}
            >
              <Text style={styles.emptyOutlineBtnText}>נקה חיפוש</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>עדיין אין קודים שמורים</Text>
          <Text style={styles.emptyText}>
            כשתשמור קוד מ{BRAND_NAME}, הוא יופיע כאן. תוכל לחזור אליו לעריכה בכל
            עת.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={openCreate}>
            <IconPlus size={18} color={colors.white} strokeWidth={2.2} />
            <Text style={styles.emptyButtonText}>ליצירת QR ראשון</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (filteredItems.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>אין קודים בסינון הזה</Text>
          <Text style={styles.emptyText}>
            {activityFilter === "active"
              ? "אין כרגע קודים מסומנים כפעילים."
              : "אין כרגע קודים מסומנים כלא פעילים."}
          </Text>
          <TouchableOpacity
            style={styles.emptyOutlineBtn}
            onPress={() => setActivityFilter("all")}
          >
            <Text style={styles.emptyOutlineBtnText}>הצג הכל</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (displayItems.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>
            {selectedViewId === "all"
              ? "אין כרגע קודים פעילים"
              : "אין קודים בתצוגה הזו"}
          </Text>
          {selectedViewId !== "all" ? (
            <TouchableOpacity
              style={styles.emptyOutlineBtn}
              onPress={() => setSelectedViewId("all")}
            >
              <Text style={styles.emptyOutlineBtnText}>חזרה לקודים פעילים</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }
    return null;
  };

  const listHeader = (
    <>
      <ScreenPageHeader
        colors={colors}
        title="קודים שמורים"
        subtitle="חיפוש, שמירה ועריכה של הקודים שלך"
      />

      <View style={styles.searchShell}>
        <IconSearch size={20} color={colors.subText} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="חיפוש לפי שם הקוד…"
          placeholderTextColor={colors.subText}
          value={nameSearch}
          onChangeText={setNameSearch}
          textAlign="right"
          editable={!accountSettingsOpen}
        />
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterChip}
          onPress={() => setFilterSheetOpen(true)}
          disabled={accountSettingsOpen}
        >
          <IconAdjustments size={18} color={colors.primary} strokeWidth={2} />
          <Text style={styles.filterChipText}>סינון ותיקיות</Text>
        </TouchableOpacity>
        <View style={[styles.filterChip, styles.filterChipView]}>
          <Text style={styles.filterChipText} numberOfLines={1}>
            {currentViewLabel}
          </Text>
        </View>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipText}>
            {ACTIVITY_LABELS[activityFilter]}
          </Text>
        </View>
      </View>

      {notice ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadList()}>
            <Text style={styles.retryText}>נסו שוב</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );

  if (accountSettingsOpen) {
    return (
      <ScreenWithAccessibility>
        <View style={styles.page}>
          <MyCodesAccountPanel
            colors={colors}
            onClose={() => setAccountSettingsOpen(false)}
            onProfileSaved={(user) => setUser(user)}
          />
        </View>
      </ScreenWithAccessibility>
    );
  }

  return (
    <ScreenWithAccessibility>
      <View style={styles.page}>
        {loading && !refreshing ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>טוען את הרשימה…</Text>
          </View>
        ) : (
          <FlatList
            data={displayItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <SavedQrCardMobile
                row={item}
                colors={colors}
                folderDisplayName={folderNameForRow(item)}
                foldersForSelect={folderState.folders}
                assignedFolderId={folderState.assignments[String(item._id)] ?? null}
                onAssignFolder={handleAssignFolder}
                onOpenEditor={openInEditor}
                onDelete={handleDelete}
                onSavedQrFromApi={handleSavedQrFromApi}
                onNotice={showNotice}
              />
            )}
            ItemSeparatorComponent={renderCardSeparator}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadList(true)}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        )}

        <MyCodesFolderSheet
          visible={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          colors={colors}
          folders={folderState.folders}
          selectedViewId={selectedViewId}
          onSelectView={(id) => {
            setAccountSettingsOpen(false);
            setSelectedViewId(id);
          }}
          counts={counts}
          activityFilter={activityFilter}
          onActivityFilterChange={(id) => {
            setAccountSettingsOpen(false);
            setActivityFilter(id);
          }}
          onCreateFolder={() => {
            setFilterSheetOpen(false);
            setFolderModalOpen(true);
          }}
          onDeleteFolder={handleDeleteFolder}
          onOpenAccount={() => setAccountSettingsOpen(true)}
          accountActive={accountSettingsOpen}
        />

        <SimplePromptModal
          visible={folderModalOpen}
          onClose={() => setFolderModalOpen(false)}
          title="תיקייה חדשה"
          description="הזן שם לתיקייה. אפשר יהיה לשייך אליה קודים מהדף הראשי."
          label="שם התיקייה"
          placeholder="למשל: לקוחות, אירועים…"
          confirmLabel="צור תיקייה"
          maxLength={80}
          defaultValue=""
          onConfirm={handleCreateFolderWithName}
        />
      </View>
    </ScreenWithAccessibility>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchShell: {
      flexDirection: "row-reverse",
      alignItems: "center",
      marginHorizontal: 20,
      marginBottom: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },
    filterBar: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      marginHorizontal: 16,
      marginBottom: 14,
      gap: 8,
    },
    filterChip: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    filterChipView: {
      flexShrink: 1,
      minWidth: 0,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
    },
    noticeBox: {
      marginHorizontal: 20,
      marginBottom: 10,
      padding: 12,
      borderRadius: 12,
      backgroundColor: `${colors.primary}22`,
    },
    noticeText: {
      fontSize: 14,
      color: colors.text,
      textAlign: "right",
    },
    errorBox: {
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.errorBg,
      borderWidth: 1,
      borderColor: colors.errorText,
    },
    errorText: {
      color: colors.errorText,
      textAlign: "right",
      fontSize: 14,
    },
    retryText: {
      marginTop: 8,
      color: colors.primary,
      fontWeight: "700",
      textAlign: "right",
    },
    loaderWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    loadingText: {
      fontSize: 15,
      color: colors.subText,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 28,
      flexGrow: 1,
    },
    cardDivider: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      gap: 10,
    },
    cardDividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      opacity: 0.9,
    },
    cardDividerDot: {
      width: 5,
      height: 5,
      borderRadius: 999,
      backgroundColor: colors.primary,
      opacity: 0.35,
    },
    emptyWrap: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 48,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.subText,
      textAlign: "center",
      marginBottom: 20,
    },
    emptyButton: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 999,
    },
    emptyButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: "700",
    },
    emptyOutlineBtn: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyOutlineBtnText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
  });
