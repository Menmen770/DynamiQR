import { Link } from "react-router-dom";
import QrTutorialTimeline from "../components/QrTutorialTimeline";

function LearnQrPage() {
  return (
    <div className="container py-5" dir="rtl">
      <main className="learn-article mx-auto">
        <h1 className="learn-title mb-3">מה זה QR?</h1>
        <p className="learn-lead mb-4">
          QR הוא ברקוד חכם: סורקים במצלמה, ומיד מגיעים לתוכן בלי להקליד. זה
          מהיר, נוח, ועובד מצוין לשיווק, שירות ומידע.
        </p>

        <section className="learn-quick-cards" aria-label="דוגמאות מהירות">
          <article className="learn-quick-card">
            <h3>אתר או דף נחיתה</h3>
            <p>סריקה אחת ומגיעים ישירות לעמוד המבצע או לטופס לידים.</p>
          </article>
          <article className="learn-quick-card">
            <h3>Wi-Fi לאורחים</h3>
            <p>התחברות לרשת בלי להקליד סיסמה - מעולה לבית עסק ואירועים.</p>
          </article>
          <article className="learn-quick-card">
            <h3>תפריט / קובץ PDF</h3>
            <p>מציגים תפריט, קטלוג או מחירון אונליין בצורה נקייה ומעודכנת.</p>
          </article>
        </section>

        <div className="learn-timeline-offset">
          <QrTutorialTimeline />
        </div>

        <div className="learn-sections-grid">
          <section className="learn-section learn-section--full">
            <h2>סטטי מול דינמי - קצר וברור</h2>
            <div className="learn-compare-grid">
              <article className="learn-compare-card">
                <h3>QR סטטי</h3>
                <p>
                  המידע מקודד בתוך הקוד עצמו. אחרי שהדפסתם - אי אפשר לשנות יעד.
                </p>
                <ul>
                  <li>
                    <strong>דוגמה:</strong> QR לרשת Wi-Fi קבועה של המשרד.
                  </li>
                  <li>
                    <strong>מתי מתאים:</strong> תוכן קבוע שלא צפוי להשתנות.
                  </li>
                </ul>
              </article>
              <article className="learn-compare-card">
                <h3>QR דינמי</h3>
                <p>
                  הקוד מפנה לכתובת ביניים, ואפשר להחליף את היעד גם אחרי הדפסה.
                </p>
                <ul>
                  <li>
                    <strong>דוגמה:</strong> QR לקמפיין שמחליף עמוד נחיתה כל חודש.
                  </li>
                  <li>
                    <strong>בונוס:</strong> אפשר לעקוב אחרי סריקות ונתוני שימוש.
                  </li>
                </ul>
              </article>
            </div>
          </section>

          <section className="learn-section">
            <h2>איך זה עובד בפועל?</h2>
            <p>
              כבעל אתר, המטרה שלך פשוטה: להעביר את הלקוח מפלייר, שלט או אריזה
              לעמוד הנכון אצלך תוך שנייה. הלקוח סורק את ה-QR במצלמה, והטלפון
              פותח מיד את היעד שהגדרת - עמוד מוצר, טופס לידים, וואטסאפ, שמירת
              איש קשר או התחברות ל-Wi-Fi.
            </p>
            <p>
              במקום לבקש מהלקוח להקליד כתובת ארוכה (ולאבד אותו בדרך), אתה נותן
              לו מעבר ישיר לפעולה שאתה רוצה שיבצע.
            </p>
          </section>

          <section className="learn-section">
            <h2>למה עסקים אוהבים QR?</h2>
            <ul>
              <li>מגדיל המרות - פחות שלבים בין חשיפה לפעולה</li>
              <li>חוסך ללקוח הקלדה ידנית ומפחית נטישה</li>
              <li>מחבר בין פרסום פיזי (שלט/פלייר/אריזה) לנכס הדיגיטלי שלך</li>
              <li>מאפשר לעדכן יעדים ומבצעים בלי להדפיס מחדש (בקוד דינמי)</li>
              <li>נותן מדידה אמיתית של סריקות וביצועים לקמפיינים</li>
            </ul>
          </section>

          <section className="learn-section">
            <h2>בחירה מהירה: מה מתאים לי?</h2>
            <p>
              אם המידע קבוע (למשל Wi-Fi קבוע או מספר טלפון) - לכו על סטטי. אם
              צריך גמישות וניהול שוטף (למשל אתר משתנה, מבצעים, A/B) - עדיף
              דינמי.
            </p>
          </section>

          <section className="learn-section">
            <h2>שימושים נפוצים</h2>
            <ul>
              <li>קישור לאתר, לדף מכירה או לטופס יצירת קשר</li>
              <li>שיתוף תפריט, קטלוג או PDF</li>
              <li>שמירת איש קשר בלחיצה אחת</li>
              <li>פתיחת שיחת WhatsApp מוכנה מראש</li>
              <li>חיבור מיידי לרשת Wi-Fi</li>
            </ul>
          </section>
        </div>

        <section className="learn-section mb-0">
          <h2>לסיכום</h2>
          <p>
            QR טוב הוא קצר למשתמש וברור לעסק. בוחרים סוג נכון (סטטי/דינמי),
            מנסחים מטרה אחת ברורה, ומרוויחים מעבר מהיר מהעולם הפיזי לדיגיטלי.
          </p>
          <div className="learn-cta-wrap mt-4">
            <Link
              to="/create"
              className="dashboard-create-layered text-decoration-none"
            >
              יצירת QR חדש
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LearnQrPage;
