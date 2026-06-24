import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";import { IconLink } from "@tabler/icons-react-native";
import { QR_TYPES_MAIN, QR_TYPES_MORE } from "./qrConstantsMobile";
import {
  buildEncodedQrText,
  effectiveSavedQrEncodedText,
} from "./qrEncodedTextMobile";

const QR_TYPE_LABELS = new Map(
  [...QR_TYPES_MAIN, ...QR_TYPES_MORE].map((t) => [t.value, t.label]),
);

const QR_TYPE_ICONS = new Map(
  [...QR_TYPES_MAIN, ...QR_TYPES_MORE].map((t) => [t.value, t.icon]),
);

export function getQrTypeLabel(qrType) {
  return QR_TYPE_LABELS.get(qrType) || qrType || "קוד QR";
}

export function getQrTypeIcon(qrType) {
  return QR_TYPE_ICONS.get(qrType) || IconLink;
}

export function formatSavedDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function ellipsis96(s) {
  const t = String(s || "").trim();
  if (!t) return "";
  return t.length > 96 ? `${t.slice(0, 96)}…` : t;
}

export function destinationSummary(row) {
  if (row?.linkMode === "dynamic") {
    const d = String(row?.dynamicTargetUrl || "").trim();
    if (d) return ellipsis96(d);
    const built = String(
      buildEncodedQrText(row?.qrType, row?.qrInputs) || "",
    ).trim();
    if (built) return ellipsis96(built);
  }
  const v = String(row?.qrValue || "").trim();
  if (v) return ellipsis96(v);
  const inputs = row?.qrInputs;
  if (inputs && typeof inputs === "object") {
    const url = inputs.url || inputs.link;
    if (typeof url === "string" && url.trim()) {
      return ellipsis96(url.trim());
    }
  }
  return "—";
}

export function cardTitle(row) {
  const dn = String(row?.displayName || "").trim();
  if (dn) return dn.length > 48 ? `${dn.slice(0, 48)}…` : dn;
  const d = destinationSummary(row);
  if (d && d !== "—") return d.length > 48 ? `${d.slice(0, 48)}…` : d;
  return getQrTypeLabel(row.qrType);
}

export function buildLoadPayload(item) {
  return {
    qrType: item.qrType,
    qrValue: item.qrValue || "",
    qrInputs: item.qrInputs || {},
    style: item.style || {},
    linkMode: item.linkMode,
    publicSlug: item.publicSlug,
    dynamicTargetUrl: item.dynamicTargetUrl,
    redirectPaused: item.redirectPaused,
    scanCount: item.scanCount,
  };
}

export { effectiveSavedQrEncodedText };

function normalizeQrDataUrl(dataUrl) {
  const raw = String(dataUrl || "").trim();
  if (!raw) throw new Error("אין תמונת QR");
  if (raw.startsWith("data:")) return raw;
  return `data:image/png;base64,${raw}`;
}

async function dataUrlToPngFileUri(dataUrl) {
  const normalized = normalizeQrDataUrl(dataUrl);
  const base64 = normalized.replace(/^data:image\/\w+;base64,/, "");
  if (!base64) throw new Error("תמונת QR לא תקינה");
  if (!FileSystem.cacheDirectory) {
    throw new Error("אחסון זמני לא זמין במכשיר");
  }
  const fileUri = `${FileSystem.cacheDirectory}qr-export-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}

async function requestGalleryWritePermission() {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync(true, ["photo"]);
    return status === "granted";
  } catch {
    return false;
  }
}

async function openSaveShareSheet(fileUri) {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("שמירה לא זמינה במכשיר זה");
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: "image/png",
    dialogTitle: "שמור את קוד ה-QR",
    UTI: "public.png",
  });
}

/** פותח את גיליון השיתוף של המערכת (וואטסאפ, מייל וכו'). */
export async function shareQrImageFromFileUri(fileUri, dialogTitle) {
  if (!fileUri) throw new Error("אין קובץ לשיתוף");
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("שיתוף לא זמין במכשיר זה");
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: "image/png",
    dialogTitle: dialogTitle || "שתף את קוד ה-QR",
    UTI: "public.png",
  });
}

/** שומר קובץ תמונה לגלריה. אם אין הרשאה / Expo Go — פותח תפריט שמירה. */
export async function saveQrImageFromFileUri(fileUri) {
  if (!fileUri) throw new Error("אין קובץ לשמירה");

  try {
    const granted = await requestGalleryWritePermission();
    if (granted) {
      try {
        await MediaLibrary.saveToLibraryAsync(fileUri);
        Alert.alert("נשמר", "קוד ה-QR נשמר בגלריה");
        return true;
      } catch {
        await MediaLibrary.createAssetAsync(fileUri);
        Alert.alert("נשמר", "קוד ה-QR נשמר בגלריה");
        return true;
      }
    }
  } catch {
    /* MediaLibrary לא זמין — ממשיכים לשיתוף */
  }

  await openSaveShareSheet(fileUri);
  Alert.alert(
    "שמירה לגלריה",
    "בחרו «שמירה לקבצים» או «גלריה» בתפריט כדי לשמור את התמונה.",
  );
  return true;
}

/** פותח שיתוף מ-data URL (ללא רקע — לשימוש בכרטיסים ישנים). */
export async function shareQrImageFromDataUrl(dataUrl, dialogTitle) {
  const fileUri = await dataUrlToPngFileUri(dataUrl);
  await shareQrImageFromFileUri(fileUri, dialogTitle);
}

/** שומר לגלריה מ-data URL (ללא רקע — לשימוש בכרטיסים ישנים). */
export async function saveQrImageToGalleryFromDataUrl(dataUrl) {
  const fileUri = await dataUrlToPngFileUri(dataUrl);
  return saveQrImageFromFileUri(fileUri);
}