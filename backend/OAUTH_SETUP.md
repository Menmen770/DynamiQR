# הגדרת OAuth (גוגל ופייסבוק)

## גוגל

1. היכנס ל-[Google Cloud Console](https://console.cloud.google.com)
2. צור פרויקט חדש או בחר קיים
3. הפעל **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
4. בחר **Web application**
5. הוסף **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback` (פיתוח)
   - `https://your-domain.com/api/auth/google/callback` (פרודקשן)
6. העתק **Client ID** ו-**Client Secret** ל־`.env`:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   ```

## פייסבוק

1. היכנס ל-[Facebook Developers](https://developers.facebook.com)
2. צור אפליקציה חדשה → **Consumer**
3. הוסף **Facebook Login** → **Settings**
4. הוסף **Valid OAuth Redirect URIs**:
   - `http://localhost:5000/api/auth/facebook/callback` (פיתוח)
   - `https://your-domain.com/api/auth/facebook/callback` (פרודקשן)
5. העתק **App ID** ו-**App Secret** ל־`.env`:
   ```
   FACEBOOK_APP_ID=xxx
   FACEBOOK_APP_SECRET=xxx
   ```

## הפעלה

אחרי מילוי ה־`.env`, הפעל מחדש את ה-backend. כפתורי ההתחברות עם גוגל ופייסבוק יופיעו בדפי ההתחברות וההרשמה.

## פרודקשן (Render)

ב־Environment של ה־backend חייבים:

- `BACKEND_URL` — כתובת הבאקאנד (למשל `https://your-api.onrender.com`) — **חייב** להתאים ל־**Authorized redirect URI** בגוגל:  
  `{BACKEND_URL}/api/auth/google/callback`
- `FRONTEND_URL` — כתובת האתר (למשל `https://your-site.onrender.com`)

אחרי התחברות מוצלחת, השרת מפנה ל־`FRONTEND_URL` עם JWT ב־hash (`#access_token=...`) כדי שהאתר יזהה משתמש גם כש־cookies חסומים בין דומיינים.
