import { I18nManager, StyleSheet } from "react-native";

/**
 * עזרי פריסה לעברית RTL — כמו dir="rtl" באתר.
 * עם forceRTL: השתמשו ב-row / flex-start (לא row-reverse / flex-end ליישור ימין).
 */

/** שורה בכיוון קריאה (ימין→שמאל בעברית) */
export const row = { flexDirection: I18nManager.isRTL ? "row" : "row-reverse" };

/** שורה הפוכה — למקרים נדירים (תוכן LTR מפורש) */
export const rowReverse = {
  flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
};

/** מיכל RTL לעמוד / כרטיס */
export const rtlView = { direction: "rtl" };

/** יישור לתחילת שורה (ימין בעברית) */
export const alignStart = { alignItems: "flex-start" };

/** יישור לסוף שורה (שמאל בעברית) */
export const alignEnd = { alignItems: "flex-end" };

/** יישור עצמי לימין (תחילת שורה ב-RTL) */
export const selfStart = { alignSelf: "flex-start" };

/** טקסט בעברית */
export const textStart = { textAlign: "right", writingDirection: "rtl" };

/** טקסט LTR (כתובות URL, מספרים) בתוך ממשק עברי */
export const textLtr = { textAlign: "left", writingDirection: "ltr" };

/** צד התחלה (ימין ב-RTL) */
export const edgeStart = (value) =>
  I18nManager.isRTL ? { right: value } : { left: value };

/** צד סיום (שמאל ב-RTL) */
export const edgeEnd = (value) =>
  I18nManager.isRTL ? { left: value } : { right: value };

/** מיזוג סגנונות RTL ל-StyleSheet */
export function rtlSheet(styles) {
  return StyleSheet.create(
    Object.fromEntries(
      Object.entries(styles).map(([key, style]) => [
        key,
        style && typeof style === "object" && !Array.isArray(style)
          ? { ...rtlView, ...style }
          : style,
      ]),
    ),
  );
}