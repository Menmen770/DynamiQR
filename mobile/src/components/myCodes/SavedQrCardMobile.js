import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  IconChartBar,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconFolder,
  IconShare2,
  IconTrash,
} from "@tabler/icons-react-native";
import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  parseJsonResponse,
} from "../../utils/api";
import {
  getSavedQrPreviewDataUrl,
  getSavedQrPreviewPixelSize,
  normalizeErrorCorrectionLevel,
} from "../../utils/savedQrPreviewMobile";
import {
  buildLoadPayload,
  cardTitle,
  destinationSummary,
  effectiveSavedQrEncodedText,
  formatSavedDate,
  getQrTypeIcon,
  getQrTypeLabel,
  saveQrImageToGalleryFromDataUrl,
  shareQrImageFromDataUrl,
} from "../../utils/savedQrHelpersMobile";
import SimplePromptModal from "./SimplePromptModal";
import SavedQrStatsModal from "./SavedQrStatsModal";
import DynamicQrEditModal from "./DynamicQrEditModal";
import QrMiniToggle from "../QrMiniToggle";
import QrPreviewComposite from "../QrPreviewComposite";
import { DEFAULT_QR_GRADIENT } from "../../utils/qrGradientsMobile";
import { row, textStart } from "../../utils/layout";

const PREVIEW_SIZE = 148;

export default function SavedQrCardMobile({
  row,
  colors,
  folderDisplayName,
  foldersForSelect,
  assignedFolderId,
  onAssignFolder,
  onOpenEditor,
  onDelete,
  onSavedQrFromApi,
  onNotice,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameBusy, setRenameBusy] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [activeBusy, setActiveBusy] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [dynamicOpen, setDynamicOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const isActive = row.isActive !== false;
  const isDynamic = row.linkMode === "dynamic";
  const scans = typeof row.scanCount === "number" ? row.scanCount : 0;
  const QrTypeIcon = getQrTypeIcon(row.qrType);
  const ecLevel = normalizeErrorCorrectionLevel(
    row?.style?.errorCorrectionLevel,
  );

  const previewStyle = useMemo(() => {
    const s = row?.style && typeof row.style === "object" ? row.style : {};
    return {
      bgColorMode: s.bgColorMode || "solid",
      bgSolidColor: s.bgColor || "#ffffff",
      bgGradient: s.bgGradient,
      stickerType: s.stickerType || "none",
      fgColor: s.fgColor || "#000000",
      qrColorMode: s.qrColorMode || "solid",
      dotsGradient: s.dotsGradient || DEFAULT_QR_GRADIENT,
      errorCorrectionLevel: normalizeErrorCorrectionLevel(s.errorCorrectionLevel),
    };
  }, [row?.style, row._id]);

  const previewPixelSize = useMemo(
    () => getSavedQrPreviewPixelSize(PREVIEW_SIZE, previewStyle.stickerType),
    [previewStyle.stickerType],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPreviewLoading(true);
      setPreviewUrl("");
      try {
        const url = await getSavedQrPreviewDataUrl(row, {
          width: previewPixelSize,
        });
        if (!cancelled) setPreviewUrl(url || "");
      } catch {
        if (!cancelled) setPreviewUrl("");
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [row._id, previewPixelSize]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "מחיקת קוד",
      "למחוק את הקוד השמור? לא ניתן לשחזר.",
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחק",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              const response = await apiFetchWithTimeout(
                `${getApiBaseUrl()}/api/saved-qrs/${row._id}`,
                { method: "DELETE" },
                20000,
              );
              if (!response.ok) {
                const data = await parseJsonResponse(response);
                throw new Error(data?.error || "מחיקה נכשלה");
              }
              onDelete(row._id);
            } catch (err) {
              onNotice(err.message || "מחיקה נכשלה");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [row._id, onDelete, onNotice]);

  const handleRenameConfirm = async (name) => {
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      onNotice("נא להזין שם.");
      return false;
    }
    setRenameBusy(true);
    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/saved-qrs/${row._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: trimmed }),
        },
        20000,
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || "עדכון השם נכשל");
      }
      if (data?.saved) onSavedQrFromApi(data.saved);
      return true;
    } catch (err) {
      onNotice(err.message || "עדכון השם נכשל");
      return false;
    } finally {
      setRenameBusy(false);
    }
  };

  const handleActiveChange = async (next) => {
    setActiveBusy(true);
    try {
      const response = await apiFetchWithTimeout(
        `${getApiBaseUrl()}/api/saved-qrs/${row._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: next }),
        },
        20000,
      );
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || "עדכון נכשל");
      }
      if (data?.saved) onSavedQrFromApi(data.saved);
    } catch (err) {
      onNotice(err.message || "עדכון נכשל");
    } finally {
      setActiveBusy(false);
    }
  };

  const openDestination = async () => {
    if (isDynamic) {
      const dest = String(row.dynamicTargetUrl || "").trim();
      if (/^https?:\/\//i.test(dest)) {
        await Linking.openURL(dest);
        return;
      }
      if (/^(mailto:|tel:|sms:)/i.test(dest)) {
        await Linking.openURL(dest);
        return;
      }
    }
    const t = effectiveSavedQrEncodedText(row);
    if (/^https?:\/\//i.test(t)) {
      await Linking.openURL(t);
      return;
    }
    if (/^(mailto:|tel:|sms:)/i.test(t)) {
      await Linking.openURL(t);
      return;
    }
    onOpenEditor(row);
  };

  const handleDownload = async () => {
    if (!previewUrl || downloading) return;
    setDownloading(true);
    try {
      await saveQrImageToGalleryFromDataUrl(previewUrl);
    } catch (err) {
      onNotice(err.message || "לא ניתן לשמור");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!previewUrl || sharing) return;
    setSharing(true);
    try {
      await shareQrImageFromDataUrl(previewUrl, `QR — ${cardTitle(row)}`);
    } catch (err) {
      onNotice(err.message || "לא ניתן לשתף");
    } finally {
      setSharing(false);
    }
  };

  const exportBusy = downloading || sharing;

  const currentFolderId =
    assignedFolderId == null || assignedFolderId === ""
      ? null
      : String(assignedFolderId);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerMetaRow}>
          <View style={styles.chipRow}>
            <View style={styles.typeChip}>
              <QrTypeIcon size={14} color={colors.primary} strokeWidth={1.85} />
              <Text style={styles.typeLabel}>{getQrTypeLabel(row.qrType)}</Text>
            </View>
            <View style={styles.badgeEc}>
              <Text style={styles.badgeEcText}>{ecLevel}</Text>
            </View>
            {isDynamic ? (
              <View style={styles.badgeDynamic}>
                <Text style={styles.badgeDynamicText}>דינמי</Text>
              </View>
            ) : (
              <View style={styles.badgeStatic}>
                <Text style={styles.badgeStaticText}>סטטי</Text>
              </View>
            )}
            {row.redirectPaused ? (
              <View style={styles.badgeWarn}>
                <Text style={styles.badgeWarnText}>מושהה</Text>
              </View>
            ) : null}
            {isDynamic ? (
              <Text style={styles.scanChip}>
                סריקות <Text style={styles.scanBold}>{scans}</Text>
              </Text>
            ) : null}
          </View>

          <View style={styles.titleGroup}>
            <Text style={styles.cardTitleText} numberOfLines={1}>
              {cardTitle(row)}
            </Text>
            <TouchableOpacity
              onPress={() => setRenameOpen(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="שנה שם"
            >
              <IconEdit size={17} color={colors.subText} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.previewCol}>
          <TouchableOpacity
            style={styles.previewWrap}
            onPress={() => previewUrl && setZoomOpen(true)}
            disabled={!previewUrl && !previewLoading}
            activeOpacity={0.85}
          >
            {previewUrl || previewLoading ? (
              <QrPreviewComposite
                colors={colors}
                qrImage={previewUrl}
                loading={previewLoading}
                error=""
                fillParent
                {...previewStyle}
              />
            ) : (
              <Text style={styles.noPreview}>אין תצוגה</Text>
            )}
          </TouchableOpacity>
          <View style={styles.previewMainBtns}>
            <TouchableOpacity
              style={[
                styles.previewActionBtn,
                styles.downloadBtn,
                (!previewUrl || exportBusy) && styles.previewActionDisabled,
              ]}
              onPress={handleDownload}
              disabled={!previewUrl || exportBusy}
            >
              <IconDownload size={16} color={colors.white} strokeWidth={2.2} />
              <Text style={styles.previewActionBtnText}>
                {downloading ? "…" : "הורד"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.previewActionBtn,
                styles.shareBtn,
                (!previewUrl || exportBusy) && styles.previewActionDisabled,
              ]}
              onPress={handleShare}
              disabled={!previewUrl || exportBusy}
            >
              <IconShare2 size={16} color={colors.white} strokeWidth={2.2} />
              <Text style={styles.previewActionBtnText}>
                {sharing ? "…" : "שתף"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCol}>
          {isDynamic ? (
            <View style={styles.activeRow}>
              <QrMiniToggle
                value={isActive}
                onValueChange={handleActiveChange}
                disabled={activeBusy}
              />
              <Text style={styles.activeLabel}>פעיל</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.destRow}
            onPress={isDynamic ? () => setDynamicOpen(true) : undefined}
            disabled={!isDynamic}
            activeOpacity={isDynamic ? 0.7 : 1}
          >
            {isDynamic ? <IconEdit size={16} color={colors.primary} /> : null}
            <Text style={styles.destText} numberOfLines={2}>
              {destinationSummary(row)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderChip} onPress={() => setFolderOpen(true)}>
            <IconFolder size={15} color={colors.primary} />
            <Text style={styles.folderChipText} numberOfLines={1}>
              {folderDisplayName || "ללא תיקייה"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateText}>{formatSavedDate(row.createdAt)}</Text>

          {isDynamic ? (
            <TouchableOpacity
              style={styles.statsBelowDateBtn}
              onPress={() => setStatsOpen(true)}
              accessibilityLabel="סטטיסטיקות"
            >
              <IconChartBar size={18} color={colors.primary} strokeWidth={2} />
              <Text style={styles.statsBelowDateText}>סטטיסטיקות</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <ActionIcon
          icon={<IconTrash size={20} color={colors.error} />}
          label="מחק"
          onPress={handleDelete}
          disabled={deleting}
          danger
          styles={styles}
        />
        <ActionIcon
          icon={<IconEdit size={20} color={colors.text} />}
          label="עריכה"
          onPress={() => onOpenEditor(row)}
          styles={styles}
        />
        <ActionIcon
          icon={<IconExternalLink size={20} color={colors.text} />}
          label="פתח"
          onPress={openDestination}
          styles={styles}
        />
      </View>

      <SimplePromptModal
        visible={renameOpen}
        onClose={() => !renameBusy && setRenameOpen(false)}
        title="שינוי שם הקוד"
        description="השם מופיע בעמוד קודים שמורים ובחיפוש."
        label="שם לקוד"
        placeholder="למשל: קמפיין אביב"
        confirmLabel="שמור שם"
        busy={renameBusy}
        defaultValue={String(row?.displayName || "").trim()}
        onConfirm={handleRenameConfirm}
      />

      <Modal visible={folderOpen} transparent animationType="fade" onRequestClose={() => setFolderOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setFolderOpen(false)}>
          <Pressable style={styles.folderSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.folderSheetTitle}>בחירת תיקייה</Text>
            <FolderOption
              label="ללא תיקייה"
              selected={currentFolderId == null}
              onPress={() => {
                onAssignFolder(row._id, null);
                setFolderOpen(false);
              }}
              styles={styles}
            />
            {(foldersForSelect || []).map((f) => (
              <FolderOption
                key={f.id}
                label={f.name}
                selected={currentFolderId === f.id}
                onPress={() => {
                  onAssignFolder(row._id, f.id);
                  setFolderOpen(false);
                }}
                styles={styles}
              />
            ))}
            {!foldersForSelect?.length ? (
              <Text style={styles.folderEmpty}>אין תיקיות — צור תיקייה בתפריט הסינון</Text>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={zoomOpen} transparent animationType="fade" onRequestClose={() => setZoomOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setZoomOpen(false)}>
          <Pressable style={styles.zoomSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.zoomTitle} numberOfLines={1}>
              {cardTitle(row)}
            </Text>
            {previewUrl ? (
              <View style={styles.zoomPreview}>
                <QrPreviewComposite
                  colors={colors}
                  qrImage={previewUrl}
                  loading={false}
                  error=""
                  {...previewStyle}
                />
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <SavedQrStatsModal
        visible={statsOpen}
        onClose={() => setStatsOpen(false)}
        colors={colors}
        row={row}
      />

      <DynamicQrEditModal
        visible={dynamicOpen}
        onClose={() => setDynamicOpen(false)}
        colors={colors}
        row={row}
        onSaved={onSavedQrFromApi}
        onError={onNotice}
      />
    </View>
  );
}

function ActionIcon({ icon, label, onPress, disabled, danger, styles }) {
  return (
    <TouchableOpacity
      style={[
        styles.actionIcon,
        danger && styles.actionIconDanger,
        disabled && styles.actionIconDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
    >
      {icon}
      <Text style={[styles.actionIconLabel, danger && styles.actionIconLabelDanger]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FolderOption({ label, selected, onPress, styles }) {
  return (
    <TouchableOpacity
      style={[styles.folderOption, selected && styles.folderOptionSelected]}
      onPress={onPress}
    >
      <Text style={[styles.folderOptionText, selected && styles.folderOptionTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: "hidden",
    },
    header: {
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerMetaRow: {
      flexDirection: "row",
      direction: "ltr",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6,
      flexShrink: 1,
      maxWidth: "58%",
    },
    typeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    typeLabel: {
      fontSize: 12,
      color: colors.subText,
      fontWeight: "600",
    },
    titleGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexShrink: 1,
      marginLeft: "auto",
      maxWidth: "42%",
    },
    cardTitleText: {
      flexShrink: 1,
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
    },
    badgeDynamic: {
      backgroundColor: `${colors.primary}22`,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    badgeDynamicText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
    },
    badgeStatic: {
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    badgeStaticText: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.subText,
    },
    badgeEc: {
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    badgeEcText: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.text,
      fontVariant: ["tabular-nums"],
    },
    badgeWarn: {
      backgroundColor: "#fef3c7",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    badgeWarnText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#92400e",
    },
    scanChip: {
      fontSize: 12,
      color: colors.subText,
    },
    scanBold: {
      fontWeight: "800",
      color: colors.text,
    },
    mainRow: {
      ...row,
      padding: 14,
      gap: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    previewCol: {
      width: PREVIEW_SIZE,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    previewWrap: {
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      borderRadius: 14,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    noPreview: {
      fontSize: 11,
      color: colors.subText,
      textAlign: "center",
      paddingHorizontal: 8,
    },
    previewMainBtns: {
      ...row,
      gap: 8,
      width: "100%",
      justifyContent: "center",
    },
    previewActionBtn: {
      flex: 1,
      flexBasis: 0,
      ...row,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 40,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 10,
    },
    downloadBtn: {
      backgroundColor: colors.primary,
    },
    shareBtn: {
      backgroundColor: colors.primaryDark,
    },
    previewActionDisabled: {
      opacity: 0.5,
    },
    previewActionBtnText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: "700",
    },
    infoCol: {
      flex: 1,
      minWidth: 0,
      gap: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    activeRow: {
      ...row,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      width: "100%",
    },
    activeLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    destRow: {
      ...row,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 2,
      width: "100%",
    },
    destText: {
      flexShrink: 1,
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
      textAlign: "center",
    },
    folderChip: {
      ...row,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      maxWidth: "100%",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: `${colors.primary}14`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.primary}44`,
    },
    folderChipText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
      textAlign: "center",
      flexShrink: 1,
    },
    dateText: {
      fontSize: 11,
      color: colors.subText,
      textAlign: "center",
      width: "100%",
    },
    statsBelowDateBtn: {
      ...row,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "stretch",
      gap: 6,
      marginTop: 2,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: `${colors.primary}10`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.primary}55`,
    },
    statsBelowDateText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
    },
    actionsRow: {
      ...row,
      flexWrap: "wrap",
      alignItems: "center",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingVertical: 8,
      paddingHorizontal: 6,
      backgroundColor: colors.background,
    },
    actionIcon: {
      flexGrow: 1,
      flexBasis: "33%",
      maxWidth: "33%",
      minWidth: 72,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      gap: 4,
    },
    actionIconDanger: {},
    actionIconDisabled: {
      opacity: 0.4,
    },
    actionIconLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.subText,
      textAlign: "center",
    },
    actionIconLabelDanger: {
      color: colors.error,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 24,
    },
    folderSheet: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      maxHeight: "70%",
    },
    folderSheetTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
      marginBottom: 12,
    },
    folderOption: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      marginBottom: 4,
    },
    folderOptionSelected: {
      backgroundColor: `${colors.primary}22`,
    },
    folderOptionText: {
      fontSize: 15,
      color: colors.text,
      textAlign: "right",
    },
    folderOptionTextSelected: {
      fontWeight: "800",
      color: colors.primary,
    },
    folderEmpty: {
      fontSize: 13,
      color: colors.subText,
      textAlign: "center",
      paddingVertical: 12,
    },
    zoomSheet: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
    },
    zoomTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 14,
      textAlign: "center",
      width: "100%",
    },
    zoomPreview: {
      width: 280,
      height: 280,
    },
  });
