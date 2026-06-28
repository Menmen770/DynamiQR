# דינמיקר (DynamiQR)

פלטפורמת דינמיקר ליצירה וניהול של קודי QR בעברית (RTL), עם התאמה אישית מתקדמת, חשבון משתמש ושמירת קודים שמורים.

הפרויקט כולל **אתר (Web)**, **שרת (Backend)** ו**אפליקציית מובייל (Expo / React Native)** — כולם בעברית ומיועדים לעבודה מול אותו API.

---

## תצוגת המערכת — אתר

<p align="center">
  <img src="frontend/src/assets/Screenshot1.png" alt="צילום מסך של דינמיקר — אתר" width="480" />
</p>

---

## אפליקציית מובייל

אפליקציית **דינמיקר** ל-Android (Expo) — ממשק מלא בעברית, RTL, עם אותן יכולות ליבה כמו באתר.

### צילומי מסך

<p align="center">
<img src="mobile/assets/images/screenshots/screenshot-1.png" alt="דינמיקר — יצירת QR" width="240"/><img src="mobile/assets/images/screenshots/screenshot-2.png" alt="דינמיקר — קודים שמורים" width="240" style="margin-left: 40px;"/>
</p>

### יכולות באפליקציה

| מסך              | תיאור                                                                            |
| ---------------- | -------------------------------------------------------------------------------- |
| **קודים שמורים** | רשימת QR שמורים, תיקיות, חיפוש, סטטיסטיקות ועריכת QR דינמי                       |
| **יצירת QR**     | זרימת 3 שלבים: תוכן → עיצוב (צבעים, גרדיאנטים, צורות, לוגו, סטיקר) → שיתוף/שמירה |
| **סריקת QR**     | מצלמה עם מסגרת סריקה, פלאש, ופתיחת קישורים אוטומטית                              |
| **מדריך**        | מדריך קצר לעסקים — שימושים, שלבים, סטטי מול דינמי                                |
| **חשבון**        | התחברות, הרשמה, פרופיל, מצב כהה ונגישות                                          |

### טכנולוגיות (מובייל)

- Expo 54 · React Native 0.81 · React Navigation 7
- `expo-camera` (סריקה) · `react-native-view-shot` (ייצוא עם רקע)
- `expo-sharing` / `expo-media-library` (שיתוף ושמירה לגלריה)
- `@tabler/icons-react-native` · תמיכה מלאה ב-RTL

### התקנה והרצה (מובייל)

```bash
cd mobile
npm install
npm start
# או
npm run android
```

> **חשוב:** ה-Backend חייב לרוץ ולהיות נגיש מהמכשיר. ל-QR דינמי בפרודקשן — השתמשו בכתובת ציבורית (ראו [פריסה ל-Render](#פריסה-חינמית-render-כדי-ש-qr-דינמי-יעבוד-גם-בטלפון)).

## מבנה תיקיות מפורט

> לא כולל: `node_modules/`, קבצי `.env` (סודות), ו-`frontend/dist/` (פלט build).

### Backend (`backend/`)

```
backend/
├── server.js                    # נקודת כניסה — חיבור MongoDB, בדיקת SMTP, האזנה לפורט
├── app.js                       # יצירת Express: CORS, session, routes, לוגו למייל
├── package.json                 # תלויות Node (Express, Mongoose, Passport…)
├── package-lock.json            # נעילת גרסאות npm
├── .env.example                 # דוגמה למשתני סביבה (MONGO, JWT, SMTP, OAuth)
│
├── config/
│   ├── env.js                   # קריאת FRONTEND_URL, BACKEND_URL ומשתני סביבה מרכזיים
│   └── passport.js              # הגדרת Google + Facebook OAuth (יצירה/מציאת משתמש)
│
├── middleware/
│   ├── session.js               # express-session (Mongo store בפרודקשן, זיכרון בפיתוח)
│   ├── requireAuth.js           # middleware — דורש משתמש מחובר (JWT או session)
│   └── rateLimiters.js          # הגבלת קצב על API ועל auth (מניעת brute force)
│
├── mongodb/
│   └── mongodb.js               # חיבור ל-MongoDB (מקומי או Atlas)
│
├── models/
│   ├── User.js                  # משתמש: אימייל, סיסמה מוצפנת, OAuth, אימות מייל
│   ├── SavedQr.js               # QR שמור: תוכן, עיצוב, slug דינמי, סטטיסטיקות
│   └── DashboardFolderState.js  # סידור תיקיות ו-QR לפי משתמש בדשבורד
│
├── routes/
│   ├── auth.js                  # הרשמה, התחברות, אימות מייל, פרופיל, Google/Facebook
│   ├── qr.js                    # POST /generate-qr — יצירת תמונת QR (base64)
│   ├── qrRedirect.js            # GET /r/:slug — הפניה ל-QR דינמי + ספירת סריקות
│   ├── savedQr.js               # CRUD קודים שמורים, חיפוש, סטטיסטיקות (aggregate)
│   └── dashboardFolders.js      # קריאה ושמירה של מבנה תיקיות בדשבורד
│
├── services/
│   ├── mailer.js                # nodemailer — שליחת מייל אימות + לוגו למייל
│   ├── emailTemplates.js        # תבנית HTML לעברית למייל אימות
│   └── qrGenerator.js           # יצירת QR בצד השרת (qr-code-styling + canvas)
│
├── utils/
│   ├── authToken.js             # JWT — חתימה, אימות, זיהוי משתמש מ-Bearer או session
│   ├── verificationCode.js      # קוד אימות 6 ספרות — יצירה, hash, תוקף
│   ├── buildEncodedQrText.js    # בניית מחרוזת QR (קישור, WiFi, vCard וכו')
│   ├── dynamicQr.js             # slug ייחודי ולוגיקת QR דינמי
│   └── rasterizeSvgDataUrl.js   # המרת SVG (לוגו) לתמונה בצד השרת
│
├── scripts/
│   ├── ping-mongo.js            # סקריפט בדיקה — האם MongoDB זמין
│   └── reset-db.js              # איפוס מסד נתונים (פיתוח בלבד)
│
└── assets/email/
    └── logo-email.png           # לוגו למיילים (~180px)
```

### Frontend (`frontend/`)

```
frontend/
├── index.html                   # דף HTML ראשי — favicon, RTL, טעינת React
├── vite.config.js               # הגדרות Vite (proxy ל-API, build)
├── eslint.config.js             # כללי lint
├── package.json                 # תלויות (React, Vite, Bootstrap…)
├── package-lock.json
├── .env.example                 # VITE_API_URL, VITE_PUBLIC_QR_BASE
│
├── public/promo-materials/      # תמונות שיווקיות לדף הבית
│   ├── business-cards.jpg
│   ├── flyers.jpg
│   ├── qr-menu.jpg
│   └── wifi-public-qr.jpg
│
└── src/
    ├── main.jsx                 # נקודת כניסה React — Router, טעינת token מ-OAuth hash
    ├── App.jsx                  # ניתוב דפים, Navbar, Footer, BackToTop
    ├── App.css                  # עיצוב גלובלי של האפליקציה
    ├── index.css                # איפוס CSS ומשתני עיצוב בסיסיים
    ├── config.js                # כתובת API (API_BASE) ממשתני Vite
    │
    ├── pages/
    │   ├── QrPage.jsx           # דף יצירת QR — זרימת 3 שלבים (תוכן → עיצוב → תצוגה)
    │   ├── DashboardPage.jsx    # קודים שמורים, תיקיות, חיפוש, סטטיסטיקות
    │   ├── LearnQrPage.jsx      # מדריך QR לעסקים
    │   ├── LoginPage.jsx        # התחברות (אימייל + Google)
    │   ├── RegisterPage.jsx     # הרשמה + מעבר לאימות מייל
    │   ├── VerifyEmailPage.jsx  # הזנת קוד אימות 6 ספרות
    │   ├── ContactPage.jsx      # צור קשר
    │   └── PrivacyTermsPage.jsx # פרטיות ותנאי שימוש
    │
    ├── components/
    │   ├── MainNavbar.jsx       # תפריט עליון — ניווט, חשבון, התנתקות
    │   ├── SiteFooter.jsx       # פוטר האתר
    │   ├── GoogleSignInLink.jsx # כפתור התחברות Google
    │   ├── RobotSpline.jsx      # אנימציית רובוט בדפי התחברות/הרשמה
    │   ├── BackToTopButton.jsx  # כפתור חזרה לראש הדף
    │   ├── AccessibilityButton.jsx  # כפתון נגישות (פותח תפריט)
    │   ├── AccessibilityButton.css
    │   ├── AccessibilityMenu.jsx    # תפריט נגישות — גודל טקסט, פונט קריא
    │   ├── AccessibilityMenu.css
    │   ├── DashboardSidebar.jsx     # סרגל צד בדשבורד — תיקיות
    │   ├── DashboardAccountPanel.jsx # עדכון פרופיל וסיסמה בדשבורד
    │   ├── SavedQrCard.jsx          # כרטיס QR שמור — תצוגה, עריכה, מחיקה
    │   ├── SavedQrStyleEditModal.jsx # עריכת עיצוב QR שמור
    │   ├── DynamicQrManageModal.jsx  # עריכת יעד ל-QR דינמי
    │   ├── SimpleTextModal.jsx       # חלון קלט טקסט כללי
    │   ├── QrTutorialTimeline.jsx    # ציר זמן מדריך בדף יצירת QR
    │   ├── QrCustomColorButton.jsx   # בורר צבע מותאם
    │   ├── StickerPreview.jsx        # תצוגה מקדימה של סטיקר מסגרת
    │   ├── WhyUsSection.jsx          # סקשן "למה אנחנו" בדף הבית
    │   ├── PromotionalMaterialsSection.jsx  # גלריית חומרי שיווק
    │   │
    │   └── qr/                       # רכיבי יצירת QR
    │       ├── index.js              # ייצוא מרוכז של רכיבי QR
    │       ├── QrTypeSelector.jsx    # בחירת סוג QR (קישור, WiFi, vCard…)
    │       ├── QrContentStep.jsx     # שלב 1 — הזנת תוכן לפי סוג
    │       ├── QrLinkModeToggle.jsx  # מעבר סטטי / דינמי לקישור
    │       ├── QrPdfInputModeToggle.jsx  # העלאת PDF או קישור
    │       ├── QrLogoInputModeToggle.jsx # לוגו מהמכשיר או preset
    │       ├── QrStylePanel.jsx      # שלב 2 — לשוניות עיצוב
    │       ├── QrStyleColorTab.jsx   # לשונית צבעים ורקע
    │       ├── QrStyleShapeTab.jsx   # לשונית צורות נקודות ופינות
    │       ├── QrStyleLogoTab.jsx    # לשונית לוגו מרכזי
    │       ├── QrStyleStickerTab.jsx # לשונית סטיקר/מסגרת
    │       ├── QrGradientPicker.jsx  # בורר גרדיאנט
    │       ├── QrPreviewPanel.jsx    # שלב 3 — תצוגה מקדימה והורדה
    │       ├── QrStaticDynamicHelpButton.jsx  # עזרה: סטטי מול דינמי
    │       ├── qrShapeAssets.js      # מיפוי קבצי צורות QR (body/edges)
    │       └── qrCopy.js             # טקסטים וכותרות לפי שלב וסוג QR
    │
    ├── hooks/
    │   ├── index.js               # ייצוא hooks
    │   └── useQrGenerator.js      # state מרכזי ליצירת QR (תוכן, עיצוב, ייצוא)
    │
    ├── constants/
    │   └── brand.js               # שם המותג, טקסטים קבועים
    │
    ├── utils/
    │   ├── authSession.js         # שמירת JWT ב-localStorage
    │   ├── qrEncodedText.js       # בניית מחרוזת QR לפי סוג (מקביל לשרת)
    │   ├── qrConstants.js         # קבועים: סוגי QR, ברירות מחדל
    │   ├── qrGradients.js         # יצירת גרדיאנטים על canvas
    │   ├── qrExportBackground.js  # צביעת רקע לייצוא PNG
    │   ├── stickerCompose.js      # הרכבת QR + מסגרת סטיקר לייצוא
    │   ├── rasterizeSvgLogo.js    # המרת SVG לוגו ל-PNG בדפדפן
    │   ├── presetBrandLogos.js    # מיפוי לוגואים מוכנים (רשתות חברתיות)
    │   ├── savedQrPreview.js      # תצוגה מקדימה של QR שמור
    │   ├── recentQrStorage.js     # שמירה מקומית של QR אחרונים (אורח)
    │   ├── dashboardFoldersApi.js # קריאות API לתיקיות דשבורד
    │   └── dashboardFoldersStorage.js  # cache מקומי לסידור תיקיות
    │
    └── assets/
        ├── logo-full.png          # לוגו דינמיקר
        ├── brand-icon.svg         # אייקון לשונית דפדפן
        ├── accessibility.png      # אייקון כפתור נגישות
        ├── Screenshot1.png        # צילום מסך ל-README
        ├── register-speech-bubble.png  # בועת דיבור בדף הרשמה
        ├── why-us-speed.svg       # אייקון "מהירות" בדף הבית
        ├── why-us-privacy.svg     # אייקון "פרטיות" בדף הבית
        ├── stickerAssets.js       # מיפוי סטיקרים (overlay + thumbnail)
        ├── body/1.svg … 6.svg     # צורות גוף לנקודות QR
        ├── edges/1.svg … 7.svg    # צורות פינות/קצוות ל-QR
        ├── preset-logos/*.svg     # לוגואים מוכנים (Google, WhatsApp, Instagram…)
        ├── sticker-overlays/      # מסגרות SVG/PNG לסטיקרים (frame-01 … frame-09)
        ├── sticker-thumbnails/    # תמונות ממוזערות לבחירת סטיקר
        └── tutorial/              # שלבי מדריך (step1–step3)
```

### Mobile (`mobile/`)

```
mobile/
├── App.js                       # נקודת כניסה — RTL, Auth, ניווט Stack + Tabs
├── app.json                     # Expo: שם אפליקציה, הרשאות מצלמה/גלריה, RTL
├── babel.config.js              # Babel ל-Expo
├── package.json                 # תלויות React Native / Expo
├── package-lock.json
├── .env.example                 # EXPO_PUBLIC_API_URL
│
├── assets/
│   ├── images/
│   │   ├── logo-full.png        # לוגו באפליקציה
│   │   ├── screenshots/         # צילומי מסך ל-README (screenshot-1, 2)
│   │   └── tutorial/            # תמונות מדריך (step1–step3)
│   ├── preset-logos/*.svg       # לוגואים מוכנים (זהה לרשימת האתר)
│   ├── qr-shapes/
│   │   ├── body/1.svg … 6.svg   # צורות גוף QR
│   │   └── edges/1.jpg … 7.jpg  # תמונות פינות QR
│   └── stickers/
│       ├── overlays/frame-01.svg … frame-08.svg  # מסגרות סטיקר
│       └── thumbnails/thumb-01.png … thumb-08.png
│
└── src/
    ├── bootstrap/
    │   └── rtl.js               # הפעלת RTL ב-I18nManager בהפעלה
    │
    ├── screens/
    │   ├── QrGeneratorScreen.js # יצירת QR — 3 שלבים (תוכן, עיצוב, שיתוף)
    │   ├── MyCodesScreen.js     # קודים שמורים, תיקיות, חיפוש
    │   ├── QrScannerScreen.js   # סריקת QR במצלמה + פלאש
    │   ├── LearnQrScreen.js     # מדריך QR לעסקים
    │   ├── LoginScreen.js       # התחברות
    │   ├── RegisterScreen.js    # הרשמה
    │   ├── VerifyEmailScreen.js # אימות מייל בקוד
    │   ├── ContactScreen.js     # צור קשר
    │   └── PrivacyScreen.js     # פרטיות ותנאים
    │
    ├── navigation/
    │   ├── MainTabNavigator.js  # טאבים תחתונים: קודים / יצירה / סריקה / מדריך
    │   └── AppTabBar.js         # עיצוב מותאם לסרגל טאבים
    │
    ├── components/
    │   ├── AppHeader.js         # כותרת עליונה — ברכה, לוגו, תפריט הגדרות
    │   ├── StackBackHeader.js   # כותרת עם חזרה במסכי Stack
    │   ├── ScreenPageHeader.js  # כותרת דף פנימית
    │   ├── ScreenWithAccessibility.js  # עטיפת מסך עם direction: rtl
    │   ├── ThemeToggle.js       # מתג מצב כהה/בהיר
    │   ├── QrTypeSelectorMobile.js     # בחירת סוג QR
    │   ├── QrContentStepMobile.js      # שלב הזנת תוכן
    │   ├── QrLinkModeToggleMobile.js   # סטטי / דינמי
    │   ├── QrStaticDynamicHelpModal.js # הסבר סטטי מול דינמי
    │   ├── QrPreviewComposite.js       # תצוגה מקדימה משולבת (QR + סטיקר)
    │   ├── QrMiniToggle.js             # מתג קטן (on/off)
    │   ├── StickerTintOverlay.js       # שכבת צבע על מסגרת סטיקר
    │   ├── SvgThumbButton.js           # כפתור עם תמונת SVG ממוזערת
    │   ├── ImageThumbButton.js         # כפתור עם תמונת ממוזערת
    │   ├── SvgGradientFill.js          # מילוי SVG בגרדיאנט
    │   │
    │   ├── auth/
    │   │   ├── AuthScreenLayout.js     # פריסת מסכי התחברות/הרשמה
    │   │   ├── AuthTextField.js        # שדה טקסט לטפסי auth
    │   │   ├── AuthPasswordField.js    # שדה סיסמה עם הצג/הסתר
    │   │   ├── GoogleSignInButton.js   # כפתור Google OAuth
    │   │   ├── AuthLegalFooter.js      # קישורים לפרטיות בתחתית
    │   │   └── authUi.js               # סגנונות משותפים ל-auth
    │   │
    │   ├── qr/
    │   │   ├── QrStylePanelMobile.js       # פאנל עיצוב — לשוניות
    │   │   ├── QrStyleColorTabMobile.js    # צבעים ורקע
    │   │   └── QrGradientPickerMobile.js   # בורר גרדיאנט
    │   │
    │   └── myCodes/
    │       ├── SavedQrCardMobile.js        # כרטיס QR שמור
    │       ├── SavedQrStatsModal.js        # מודל סטטיסטיקות סריקות
    │       ├── DynamicQrEditModal.js       # עריכת יעד QR דינמי
    │       ├── MyCodesFolderSheet.js       # ניהול תיקיות
    │       ├── MyCodesAccountPanel.js      # פאנל חשבון בקודים שמורים
    │       └── SimplePromptModal.js        # חלון קלט טקסט פשוט
    │
    ├── hooks/
    │   └── useQrGeneratorMobile.js  # state מרכזי ליצירת QR באפליקציה
    │
    ├── context/
    │   ├── AuthContext.js           # משתמש מחובר, token, login/logout
    │   └── AccessibilityContext.js  # מצב כהה + פלטת צבעים דינמית
    │
    ├── constants/
    │   ├── brand.js                 # שם מותג ולוגו
    │   └── theme.js                 # צבעי ברירת מחדל (לפני dark mode)
    │
    ├── content/
    │   └── learnQrContent.js        # טקסטים ומבנה למסך המדריך
    │
    └── utils/
        ├── api.js                   # fetch ל-API + Bearer token + timeout
        ├── layout.js                # עזרי RTL (row, textStart, rtlView)
        ├── qrEncodedTextMobile.js   # בניית מחרוזת QR לפי סוג
        ├── qrConstantsMobile.js     # קבועים לסוגי QR
        ├── qrGradientsMobile.js     # גרדיאנטים
        ├── qrShapeAssetsMobile.js   # מיפוי צורות QR
        ├── presetLogosMobile.js     # לוגואים מוכנים
        ├── stickerAssetsMobile.js   # מיפוי סטיקרים
        ├── prepareLogoImageMobile.js # הכנת תמונת לוגו מהגלריה
        ├── svgDataUrlFromModule.js  # המרת require() של SVG ל-data URL
        ├── qrExportCaptureMobile.js # צילום QR לשיתוף/שמירה (view-shot)
        ├── savedQrPreviewMobile.js  # תצוגה מקדימה QR שמור
        ├── savedQrHelpersMobile.js  # עזרים לניהול QR שמורים
        ├── dashboardFoldersApiMobile.js    # API תיקיות
        └── dashboardFoldersStorageMobile.js # cache תיקיות מקומי
```

---

## למי המערכת מיועדת

המערכת מתאימה לעסקים, בעלי אתרים ויוצרים שרוצים ליצור קודי QR מעוצבים לשיתוף מהיר של קישורים, קבצים, פרטי קשר ותוכן שיווקי — מהדפדפן או מהטלפון.

## יכולות מרכזיות

- יצירת QR למגוון שימושים: אתר, PDF, אימייל, טלפון, SMS, WhatsApp, Wi‑Fi, vCard ורשתות חברתיות.
- התאמה אישית מלאה: צבעים, גרדיאנטים, סגנון נקודות ופינות, לוגו וסטיקרים.
- הורדה / שיתוף באיכות גבוהה (`PNG` באתר; שיתוף ושמירה באפליקציה).
- מערכת משתמשים: הרשמה, התחברות, עדכון פרופיל והתנתקות.
- שמירת QR באזור האישי, תיקיות, וסטטיסטיקות ל-QR דינמי.
- ממשק מלא בעברית עם תמיכה ב-RTL (אתר + מובייל).
- מצב כהה ותפריט נגישות באפליקציה.

---

## התחלה מהירה

### דרישות

- Node.js 18 ומעלה
- npm
- MongoDB (מקומי או בענן)
- **למובייל:** Expo Go או Android Emulator

### התקנה

```
# Frontend (אתר)
cd frontend
npm install

# Backend (שרת)
cd ../backend
npm install

# Mobile (אופציונלי)
cd ../mobile
npm install
```

### הגדרת משתני סביבה (Backend)

`backend/.env`:

```
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=replace_with_strong_secret
JWT_SECRET=replace_with_jwt_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

### הרצה מקומית

טרמינל 1 — Backend:

```
cd backend
npm run dev
```

טרמינל 2 — Frontend:

```
cd frontend
npm run dev
```

טרמינל 3 — Mobile (אופציונלי):

```
cd mobile
npm start
```

כתובות ברירת מחדל:

| שירות         | כתובת                    |
| ------------- | ------------------------ |
| Frontend      | `http://localhost:5173`  |
| Backend       | `http://localhost:5000`  |
| Mobile (Expo) | QR בטרמינל / `exp://...` |

---

## איך משתמשים

### באתר

1. בוחרים סוג QR.
2. מזינים תוכן (קישור, מספר, טקסט וכו').
3. מבצעים התאמה עיצובית.
4. מייצרים ומורידים ב-`PNG` או `SVG`.
5. משתמש מחובר — גישה לקודים שמורים.

### באפליקציה

1. **יצירת QR** — בוחרים סוג, מזינים תוכן, מעצבים, ואז **שתף / שמור**.
2. **קודים שמורים** — ניהול, תיקיות, הורדה וסטטיסטיקות.
3. **סריקה** — מצלמה עם פלאש; קישורים נפתחים אוטומטית.

---

## אבטחה ופרטיות

- קובץ `.env` אינו אמור להיכנס ל-Git.
- סשנים מנוהלים בצד השרת עם `httpOnly` cookies.
- סיסמאות נשמרות מוצפנות (`bcrypt`).
- Rate limiting על נקודות API רגישות.

---

## API (Backend)

כתובת בסיס: `http://localhost:5000` · נקודות מוגנות דורשות session או JWT.

**אימות** (`/api/auth`)

| Method | Path                   | תיאור                     |
| ------ | ---------------------- | ------------------------- |
| POST   | `register`             | הרשמה + קוד אימות למייל   |
| POST   | `verify-email`         | אימות — `{ email, code }` |
| POST   | `resend-verification`  | שליחת קוד מחדש            |
| POST   | `login` / `logout`     | התחברות / התנתקות         |
| GET    | `me`                   | פרופיל מחובר              |
| PUT    | `profile` / `password` | עדכון שם / סיסמה          |
| GET    | `google` / `facebook`  | OAuth                     |

**QR**

| Method | Path               | תיאור                           |
| ------ | ------------------ | ------------------------------- |
| POST   | `/api/generate-qr` | יצירת QR (base64)               |
| GET    | `/api/r/:slug`     | הפניה ל-QR דינמי + ספירת סריקות |

**קודים שמורים** (`/api/saved-qrs` — מחובר)

| Method | Path         | תיאור                   |
| ------ | ------------ | ----------------------- |
| GET    | `/`          | רשימה — `?limit&skip&q` |
| POST   | `/`          | שמירה                   |
| PATCH  | `/:id`       | עדכון                   |
| GET    | `/:id/stats` | סטטיסטיקות              |
| DELETE | `/:id`       | מחיקה                   |

**דשבורד** — `GET/PUT /api/dashboard/folders` (מחובר)

---

## מבנה הפרויקט (סיכום)

```
DynamiQR/
├── frontend/          # React + Vite — אתר
├── backend/           # Express + MongoDB — API
├── mobile/            # Expo — אפליקציית Android
└── README.md
```

## רישיון

Private project © menmen770
