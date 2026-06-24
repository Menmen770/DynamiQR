import { I18nManager } from "react-native";

/**
 * ממשק עברית RTL — כמו dir="rtl" באתר.
 * אחרי הפעלה ראשונה ייתכן צורך ב-reload של האפליקציה.
 */
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export const IS_RTL = I18nManager.isRTL;
