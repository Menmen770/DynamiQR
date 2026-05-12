import {
  FiLink,
  FiFileText,
  FiMail,
  FiPhone,
  FiUser,
  FiMessageCircle,
} from "react-icons/fi";
import { IoWifi } from "react-icons/io5";
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { STICKER_IMAGE_FRAMES } from "../assets/stickerAssets";

export const PRESET_QR_COLORS = [
  { name: "שחור", hex: "#111111" },
  { name: "גרפיט", hex: "#1f2937" },
  { name: "אפור עשן", hex: "#4b5563" },
  { name: "פייסבוק / טלגרם", hex: "#1877f2" },
  { name: "כחול עמוק", hex: "#1d4ed8" },
  { name: "טורקיז", hex: "#0a9396" },
  { name: "וואטסאפ", hex: "#25d366" },
  { name: "ירוק כהה", hex: "#166534" },
  { name: "זית כהה", hex: "#3f6212" },
  { name: "בורדו", hex: "#7f1d1d" },
  { name: "סגול כהה", hex: "#5b21b6" },
];

export const PRESET_BG_COLORS = [
  { name: "צהוב רך", hex: "#fde68a" },
  { name: "כתום עדין", hex: "#fdba74" },
  { name: "אלמוג בהיר", hex: "#fca5a5" },
  { name: "ורוד", hex: "#f9a8d4" },
  { name: "לבנדר", hex: "#ddd6fe" },
  { name: "תכלת", hex: "#bfdbfe" },
  { name: "כחול בהיר", hex: "#93c5fd" },
  { name: "מנטה", hex: "#a7f3d0" },
  { name: "ירוק בהיר", hex: "#86efac" },
  { name: "ליים", hex: "#d9f99d" },
  { name: "אפור ניטרלי", hex: "#e5e7eb" },
];

export const BODY_SHAPES = [
  { id: "square", name: "Square" },
  { id: "dots", name: "Dots" },
  { id: "rounded", name: "Rounded" },
  { id: "extra-rounded", name: "Extra Rounded" },
  { id: "classy", name: "Classy" },
  { id: "classy-rounded", name: "Classy Rounded" },
];

export const CORNER_SHAPES = [
  { id: "square", name: "Square" },
  { id: "dot", name: "Dot" },
  { id: "rounded", name: "Rounded" },
  { id: "extra-rounded", name: "Extra Rounded" },
  { id: "classy", name: "Classy" },
  { id: "classy-rounded", name: "Classy Rounded" },
  { id: "dots", name: "Dots" },
];

export const ERROR_CORRECTION_LEVELS = [
  { id: "L", name: "L", description: "מהיר ודחוס יותר" },
  { id: "M", name: "M", description: "איזון טוב" },
  { id: "Q", name: "Q", description: "מומלץ עם לוגו" },
  { id: "H", name: "H", description: "עמידות מקסימלית" },
];

export const STICKER_OPTIONS = [
  { id: "none", name: "ללא" },
  ...STICKER_IMAGE_FRAMES,
];

export const QR_TYPES_MAIN = [
  { value: "url", label: "אתר", icon: FiLink },
  { value: "pdf", label: "קובץ PDF", icon: FiFileText },
  { value: "email", label: "אימייל", icon: FiMail },
  { value: "contact", label: "איש קשר", icon: FiUser },
  { value: "whatsapp", label: "וואטסאפ", icon: FaWhatsapp },
  { value: "phone", label: "טלפון", icon: FiPhone },
  { value: "sms", label: "הודעת SMS", icon: FiMessageCircle },
];

export const QR_TYPES_MORE = [
  { value: "wifi", label: "Wi-Fi", icon: IoWifi },
  { value: "facebook", label: "פייסבוק", icon: FaFacebook },
  { value: "instagram", label: "אינסטגרם", icon: FaInstagram },
  { value: "twitter", label: "X / טוויטר", icon: FaXTwitter },
  { value: "linkedin", label: "לינקדאין", icon: FaLinkedin },
  { value: "youtube", label: "יוטיוב", icon: FaYoutube },
  { value: "tiktok", label: "טיקטוק", icon: FaTiktok },
];

export const QR_TYPES = [...QR_TYPES_MAIN, ...QR_TYPES_MORE];
