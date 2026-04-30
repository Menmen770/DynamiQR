# QR Code Creator

אפליקציה ליצירה וניהול של קודי QR בעברית (RTL), עם התאמה אישית מתקדמת, חשבון משתמש ושמירת היסטוריית קודים אחרונים.

## תצוגת המערכת

<p align="center">
	<img src="frontend/src/assets/Screenshot1.png" alt="צילום מסך של מערכת QR Code Creator" width="920" />
</p>

## למי המערכת מיועדת

המערכת מתאימה לעסקים, בעלי אתרים ויוצרים שרוצים ליצור קודי QR מעוצבים לשיתוף מהיר של קישורים, קבצים, פרטי קשר ותוכן שיווקי.

## יכולות מרכזיות

- יצירת QR למגוון שימושים: אתר, PDF, אימייל, טלפון, SMS, WhatsApp, Wi‑Fi, vCard ורשתות חברתיות.
- התאמה אישית מלאה: צבעים, סגנון נקודות ופינות, והוספת לוגו במרכז.
- הורדה באיכות גבוהה בפורמטים `PNG` ו־`SVG`.
- מערכת משתמשים: הרשמה, התחברות, עדכון פרופיל והתנתקות.
- שמירת QR אחרונים באזור האישי לנוחות שימוש חוזר.
- ממשק מלא בעברית עם תמיכה ב־RTL.

## התחלה מהירה

### דרישות

- Node.js 18 ומעלה
- npm
- MongoDB (מקומי או בענן)

### התקנה

```bash
cd frontend
npm install

cd ../backend
npm install
```

### הגדרת משתני סביבה (Backend)

יש ליצור קובץ `backend/.env` עם הערכים הבאים:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=replace_with_strong_secret
```

### הרצה

טרמינל 1:

```bash
cd backend
npm run dev
```

טרמינל 2:

```bash
cd frontend
npm run dev
```

כתובות ברירת מחדל:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## פריסה חינמית (Render) כדי ש-QR דינמי יעבוד גם בטלפון

כדי שסריקה מהטלפון תעבוד, ה-QR הדינמי חייב להפנות לכתובת ציבורית (לא `localhost`).

### 1) פריסת Backend ל-Render

הפרויקט כולל `render.yaml` בשורש, לכן אפשר לפרוס ישירות מ-GitHub.

ב-Render:

1. יוצרים `New +` -> `Blueprint`.
2. בוחרים את הריפו.
3. מאשרים יצירה של השירות `qr-code-creator-backend`.
4. מגדירים Environment Variables (לפחות):
   - `MONGO_URI` (Mongo Atlas)
   - `SESSION_SECRET`
   - `JWT_SECRET`
   - `FRONTEND_URL` (דומיין הפרונט שלך)
   - `BACKEND_URL` (דומיין ה-Render שקיבלת)

### 2) הגדרת Frontend לדומיין הציבורי של ה-Backend

יוצרים קובץ `frontend/.env` לפי `frontend/.env.example`:

```env
VITE_API_URL=https://your-backend-domain.onrender.com
VITE_PUBLIC_QR_BASE=https://your-backend-domain.onrender.com
```

אחר כך בונים ומעלים את ה-frontend מחדש.

### 3) בדיקה מהירה מהטלפון

1. מייצרים QR דינמי חדש.
2. מוודאים שהקישור המקודד נראה כמו:
   `https://your-backend-domain.onrender.com/api/r/<slug>`
3. סורקים מהטלפון ומוודאים:
   - יש הפניה ליעד
   - המונה/סטטיסטיקה מתעדכנים בדשבורד
4. משנים יעד URL ל-QR קיים ובודקים שהסריקה הבאה מפנה ליעד החדש.

## איך משתמשים

1. בוחרים סוג QR.
2. מזינים את התוכן הרלוונטי (קישור, מספר, טקסט וכו').
3. מבצעים התאמה עיצובית לפי צורך.
4. מייצרים ומורידים את הקוד בפורמט הרצוי.
5. משתמש מחובר יכול לגשת במהירות ל־QR האחרונים שלו.

## אבטחה ופרטיות

- קובץ `.env` אינו אמור להיכנס ל־Git.
- סשנים מנוהלים בצד השרת עם `httpOnly` cookies.
- סיסמאות נשמרות בצורה מוצפנת באמצעות `bcrypt`.

## API עיקרי

- `POST /api/generate-qr`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

## פתרון תקלות נפוצות

- אם ההתחברות נכשלת, יש לוודא ש־MongoDB זמין וש־`MONGO_URI` תקין.
- אם לא נוצר QR, יש לוודא שה־Backend פעיל על פורט `5000`.
- אם אין סשן משתמש בדפדפן, יש לוודא עבודה מול `localhost` ושה־cookies מאופשרים.

## רישיון

Private project © menmen770
