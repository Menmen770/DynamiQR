# תיעוד API — שרת דינמיקר (DynamiQR)

שרת Express + MongoDB. כתובת בסיס מקומית: `http://localhost:5000`

---

## אימות (Auth)

| Method | כתובת                           | התחברות נדרשת?     | תיאור                                  |
| ------ | ------------------------------- | ------------------ | -------------------------------------- |
| POST   | `/api/auth/register`            | לא                 | הרשמה — שולח קוד אימות למייל           |
| POST   | `/api/auth/verify-email`        | לא                 | אימות אימייל — body: `{ email, code }` |
| POST   | `/api/auth/resend-verification` | לא                 | שליחת קוד אימות מחדש                   |
| POST   | `/api/auth/login`               | לא                 | התחברות — email + password             |
| POST   | `/api/auth/logout`              | לא                 | התנתקות                                |
| GET    | `/api/auth/me`                  | כן (session / JWT) | פרופיל המשתמש המחובר                   |
| PUT    | `/api/auth/profile`             | כן                 | עדכון שם מלא                           |
| PUT    | `/api/auth/password`            | כן                 | שינוי סיסמה                            |
| GET    | `/api/auth/google`              | לא                 | התחברות Google OAuth                   |
| GET    | `/api/auth/facebook`            | לא                 | התחברות Facebook OAuth                 |

---

## QR — יצירה והפניה

| Method | כתובת              | התחברות | תיאור                           |
| ------ | ------------------ | ------- | ------------------------------- |
| POST   | `/api/generate-qr` | לא      | יצירת תמונת QR (מחזיר base64)   |
| GET    | `/api/r/:slug`     | לא      | QR דינמי — הפניה + ספירת סריקות |

---

## QR שמורים (Saved QR)

| Method | כתובת                      | התחברות | תיאור                                 |
| ------ | -------------------------- | ------- | ------------------------------------- |
| GET    | `/api/saved-qrs`           | כן      | רשימה — `?limit=20&skip=0&q=חיפוש` (sort, skip, limit) |
| POST   | `/api/saved-qrs`           | כן      | שמירת QR חדש                          |
| PATCH  | `/api/saved-qrs/:id`       | כן      | עדכון QR (שם, עיצוב, יעד דינמי)       |
| GET    | `/api/saved-qrs/:id/stats` | כן      | סטטיסטיקות — aggregate + populate     |
| DELETE | `/api/saved-qrs/:id`       | כן      | מחיקת QR                              |

---

## דשבורד — תיקיות

| Method | כתובת                    | התחברות | תיאור              |
| ------ | ------------------------ | ------- | ------------------ |
| GET    | `/api/dashboard/folders` | כן      | קבלת סידור תיקיות  |
| PUT    | `/api/dashboard/folders` | כן      | שמירת סידור תיקיות |

---

## כללי

| Method | כתובת | תיאור |
|--------|--------|--------|
| GET | `/` | בדיקת תקינות — "Server is UP" |

> **תיעוד מלא:** קובץ זה (`backend/API.md`). OPTIONS נתמך דרך CORS על כל `/api/*`.

---

## שאילתות MongoDB (קורס)

| יכולת | איפה בפרויקט |
|--------|----------------|
| **Sort** | `GET /api/saved-qrs` — `.sort({ createdAt: -1 })` |
| **Limit** | `GET /api/saved-qrs` — `?limit=20` |
| **Skip** | `GET /api/saved-qrs` — `?skip=0` (דילוג לעמוד הבא) |
| **$regex** | `GET /api/saved-qrs` — `?q=חיפוש` |
| **Aggregate + Group** | `GET /api/saved-qrs/:id/stats` — `$group` לפי OS ומדינה |
| **populate** | stats — `.populate("userId", "fullName email")` |

---

## מודלים ב-MongoDB

| מודל                     | תיאור                                          |
| ------------------------ | ---------------------------------------------- |
| **User**                 | משתמשים — validators, pre-save לסיסמה (bcrypt) |
| **SavedQr**              | קודי QR שמורים — ref ל-User                    |
| **DashboardFolderState** | תיקיות וסידור QR לפי משתמש                     |

---

## אבטחה

- סיסמאות מוצפנות (bcrypt) ב-pre-save middleware
- JWT + Session cookies
- Rate limiting על endpoints רגישים
- שליחת מייל אימות (nodemailer) אחרי הרשמה

---

_קובץ זה הוא התיעוד הראשי של ה-API לצורך הגשה ובדיקה._
