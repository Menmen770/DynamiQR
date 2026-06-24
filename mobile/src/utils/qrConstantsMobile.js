import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandYoutube,
  IconFileText,
  IconLink,
  IconMail,
  IconMessageCircle,
  IconPhone,
  IconUser,
  IconWifi,
} from "@tabler/icons-react-native";

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
];

export const ERROR_CORRECTION_LEVELS = [
  { id: "L", label: "L", description: "מהיר ודחוס" },
  { id: "M", label: "M", description: "איזון טוב" },
  { id: "Q", label: "Q", description: "מומלץ עם לוגו" },
  { id: "H", label: "H", description: "עמידות מקסימלית" },
];

export const QR_TYPES_MAIN = [
  { value: "url", label: "אתר", icon: IconLink },
  { value: "pdf", label: "קובץ PDF", icon: IconFileText },
  { value: "email", label: "אימייל", icon: IconMail },
  { value: "contact", label: "איש קשר", icon: IconUser },
  { value: "whatsapp", label: "וואטסאפ", icon: IconBrandWhatsapp },
  { value: "phone", label: "טלפון", icon: IconPhone },
];

export const QR_TYPES_MORE = [
  { value: "sms", label: "הודעת SMS", icon: IconMessageCircle },
  { value: "wifi", label: "Wi-Fi", icon: IconWifi },
  { value: "facebook", label: "פייסבוק", icon: IconBrandFacebook },
  { value: "instagram", label: "אינסטגרם", icon: IconBrandInstagram },
  { value: "twitter", label: "X / טוויטר", icon: IconBrandX },
  { value: "linkedin", label: "לינקדאין", icon: IconBrandLinkedin },
  { value: "youtube", label: "יוטיוב", icon: IconBrandYoutube },
  { value: "tiktok", label: "טיקטוק", icon: IconBrandTiktok },
];

export const QR_TYPES = [...QR_TYPES_MAIN, ...QR_TYPES_MORE];

export const GENERATOR_STEPS = [
  { id: "content", label: "תוכן", icon: "1" },
  { id: "style", label: "עיצוב", icon: "2" },
  { id: "export", label: "הורדה", icon: "3" },
];

export const STYLE_TABS = [
  { id: "color", label: "צבע" },
  { id: "shape", label: "צורה" },
  { id: "logo", label: "לוגו" },
  { id: "sticker", label: "סטיקר" },
  { id: "advanced", label: "מתקדם" },
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
