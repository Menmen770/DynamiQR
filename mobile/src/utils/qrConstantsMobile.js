export const PRESET_QR_COLORS = [
  { name: "שחור", hex: "#111111" },
  { name: "גרפיט", hex: "#1f2937" },
  { name: "אפור עשן", hex: "#4b5563" },
  { name: "פייסבוק", hex: "#1877f2" },
  { name: "כחול עמוק", hex: "#1d4ed8" },
  { name: "טורקיז", hex: "#0a9396" },
  { name: "וואטסאפ", hex: "#25d366" },
  { name: "ירוק כהה", hex: "#166534" },
  { name: "זית", hex: "#3f6212" },
  { name: "בורדו", hex: "#7f1d1d" },
  { name: "סגול", hex: "#5b21b6" },
];

export const PRESET_BG_COLORS = [
  { name: "צהוב רך", hex: "#fde68a" },
  { name: "כתום", hex: "#fdba74" },
  { name: "אלמוג", hex: "#fca5a5" },
  { name: "ורוד", hex: "#f9a8d4" },
  { name: "לבנדר", hex: "#ddd6fe" },
  { name: "תכלת", hex: "#bfdbfe" },
  { name: "כחול בהיר", hex: "#93c5fd" },
  { name: "מנטה", hex: "#a7f3d0" },
  { name: "ירוק בהיר", hex: "#86efac" },
  { name: "ליים", hex: "#d9f99d" },
  { name: "אפור", hex: "#e5e7eb" },
];

export const BODY_SHAPES = [
  { id: "square", label: "סטנדרט" },
  { id: "dots", label: "נקודות" },
  { id: "rounded", label: "מעוגל" },
  { id: "extra-rounded", label: "מעוגל+" },
  { id: "classy", label: "קלאסי" },
  { id: "classy-rounded", label: "קלאסי מעוגל" },
];

export const CORNER_SHAPES = [
  { id: "square", label: "סטנדרט" },
  { id: "dot", label: "נקודה" },
  { id: "rounded", label: "מעוגל" },
  { id: "extra-rounded", label: "מעוגל+" },
  { id: "classy", label: "קלאסי" },
  { id: "classy-rounded", label: "קלאסי מעוגל" },
  { id: "dots", label: "נקודות" },
];

/** כמו ב־stickerCompose באתר — QR קטן יותר בתוך החור */
export const STICKER_QR_INNER_SCALE = 0.78;

/** כמו ב־stickerAssets באתר */
export const STICKER_QR_NORMALIZED_RECT = {
  x: 202 / 1125,
  y: 200 / 1125,
  width: (915.730469 - 202) / 1125,
  height: (920.261719 - 200) / 1125,
};
