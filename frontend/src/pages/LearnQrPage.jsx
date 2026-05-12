import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBarChart2,
  FiCheckCircle,
  FiFileText,
  FiGlobe,
  FiRefreshCw,
  FiTrendingUp,
  FiWifi,
  FiZap,
} from "react-icons/fi";

function LearnQrPage() {
  const useCases = [
    {
      title: "אתר או דף נחיתה",
      text: "מעבירים לקוח מפלייר, אריזה או שלט ישירות לעמוד הנכון בלי להקליד כתובת.",
      icon: FiGlobe,
    },
    {
      title: "Wi-Fi לאורחים",
      text: "סריקה אחת והמשתמש מתחבר לרשת בלי להסתבך עם סיסמה ארוכה.",
      icon: FiWifi,
    },
    {
      title: "תפריט, קטלוג או PDF",
      text: "מציגים מידע מעודכן ונקי בלי להדפיס כל גרסה מחדש.",
      icon: FiFileText,
    },
    {
      title: "לידים, וואטסאפ ופניות",
      text: "מקצרים את הדרך לפעולה ומגדילים את הסיכוי שהלקוח באמת ימשיך לשלב הבא.",
      icon: FiTrendingUp,
    },
  ];

  const steps = [
    {
      num: "01",
      title: "בוחרים יעד אחד ברור",
      text: "אתר, PDF, איש קשר, WhatsApp או Wi-Fi. ככל שהמטרה ברורה יותר, גם הסריקה תעבוד טוב יותר.",
    },
    {
      num: "02",
      title: "מעצבים כך שיהיה קל לסרוק",
      text: "שומרים על ניגודיות טובה, לוגו במידה נכונה ורמת תיקון שגיאות שמתאימה לשימוש בפועל.",
    },
    {
      num: "03",
      title: "שולחים לדפוס או לדיגיטל",
      text: "מטמיעים על שלט, פלייר, אריזה, מסך או כרטיס ביקור ומוודאים שהמעבר מהיר ונוח בטלפון.",
    },
  ];

  const benefits = [
    "פחות חיכוך בין חשיפה לפעולה",
    "מעבר מיידי מהעולם הפיזי לדיגיטלי",
    "מתאים גם לשילוט, דפוס, אריזות ומסכים",
    "בדינמי אפשר לעדכן יעד בלי להדפיס מחדש",
    "אפשר למדוד סריקות וביצועים בקמפיינים",
  ];

  const tips = [
    "אם התוכן קבוע ולא צפוי להשתנות, בדרך כלל סטטי מספיק.",
    "אם יש קמפיינים, מבצעים או צורך במדידה, עדיף דינמי.",
    "עדיף QR אחד עם מטרה אחת ברורה מאשר יותר מדי מידע בפעם אחת.",
  ];

  return (
    <div className="container py-5 learn-page" dir="rtl">
      <main className="learn-article learn-page-shell mx-auto">
        <section className="learn-hero">
          <div className="learn-hero-copy">
            <span className="learn-eyebrow">מדריך קצר לעסקים ולמותגים</span>
            <h1 className="learn-title mb-3">מה זה QR ואיך משתמשים בו נכון?</h1>
            <p className="learn-lead mb-0">
              QR הוא קיצור דרך חכם מהעולם הפיזי לדיגיטלי: סורקים עם מצלמה,
              ומגיעים מיד לעמוד, קובץ, טופס, WhatsApp, איש קשר או Wi-Fi בלי
              להקליד ובלי לאבד את המשתמש בדרך.
            </p>

            <div className="learn-hero-actions">
              <Link
                to="/create"
                className="dashboard-create-layered text-decoration-none"
              >
                יצירת QR חדש
              </Link>
            </div>
          </div>

          <aside className="learn-hero-panel" aria-label="עיקרי הדברים">
            <span className="learn-panel-kicker">בשורה התחתונה</span>
            <h2>למה עסקים משתמשים ב־QR?</h2>

            <ul className="learn-hero-point-list">
              <li>
                <span className="learn-hero-point-icon" aria-hidden>
                  <FiZap />
                </span>
                מעבר מהיר יותר לפעולה בלי הקלדה ידנית
              </li>
              <li>
                <span className="learn-hero-point-icon" aria-hidden>
                  <FiRefreshCw />
                </span>
                ב־QR דינמי אפשר לעדכן יעד גם אחרי הדפסה
              </li>
              <li>
                <span className="learn-hero-point-icon" aria-hidden>
                  <FiBarChart2 />
                </span>
                אפשר למדוד סריקות ולהבין מה באמת עובד
              </li>
            </ul>

            <div className="learn-hero-stat-grid">
              <div className="learn-hero-stat">
                <span className="learn-hero-stat-label">פחות חיכוך</span>
                <strong>סריקה אחת</strong>
                <p>ומעבר מיידי לתוכן</p>
              </div>
              <div className="learn-hero-stat">
                <span className="learn-hero-stat-label">יותר גמישות</span>
                <strong>דינמי</strong>
                <p>כשרוצים לעדכן יעד</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="learn-block">
          <div className="learn-block-head">
            <span className="learn-section-kicker">שימושים נפוצים</span>
            <h2>איפה QR באמת חוסך זמן</h2>
            <p>
              כשנותנים ללקוח מעבר ישיר לדבר הנכון, הסיכוי שהוא ימשיך לפעולה
              גדל משמעותית.
            </p>
          </div>

          <div className="learn-use-grid">
            {useCases.map((item) => {
              const Icon = item.icon;
              return (
                <article className="learn-use-card" key={item.title}>
                  <span className="learn-card-icon" aria-hidden>
                    <Icon />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="learn-block">
          <div className="learn-block-head">
            <span className="learn-section-kicker">איך זה עובד</span>
            <h2>שלושה שלבים פשוטים</h2>
            <p>לא צריך לסבך את זה: בוחרים מטרה, מעצבים נכון, ומפרסמים.</p>
          </div>

          <div className="learn-steps-grid">
            {steps.map((step) => (
              <article className="learn-step-card" key={step.num}>
                <span className="learn-step-number">{step.num}</span>
                <div className="learn-step-copy">
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="learn-block">
          <div className="learn-block-head">
            <span className="learn-section-kicker">סטטי מול דינמי</span>
            <h2>מה מתאים לך?</h2>
            <p>
              ההבדל פשוט: האם היעד נשאר קבוע, או שצריך גמישות ועדכון גם אחרי
              שהקוד כבר יצא החוצה?
            </p>
          </div>

          <div className="learn-compare-grid">
            <article className="learn-compare-card learn-compare-card--static">
              <span className="learn-compare-badge">QR סטטי</span>
              <h3>מתאים לתוכן שלא משתנה</h3>
              <p>
                המידע מקודד בתוך הקוד עצמו, ולכן אחרי הדפסה אי אפשר להחליף יעד.
              </p>
              <ul className="learn-check-list">
                <li>
                  <FiCheckCircle aria-hidden />
                  Wi-Fi קבוע, טלפון, אימייל או עמוד שלא משתנה
                </li>
                <li>
                  <FiCheckCircle aria-hidden />
                  פשוט ומהיר כשאין צורך בניהול שוטף
                </li>
              </ul>
            </article>

            <article className="learn-compare-card learn-compare-card--dynamic">
              <span className="learn-compare-badge">QR דינמי</span>
              <h3>מתאים לקמפיינים ותוכן חי</h3>
              <p>
                הקוד מפנה לכתובת ביניים, ולכן אפשר לעדכן יעד ולעקוב אחרי סריקות
                גם אחרי שהקוד כבר הודפס.
              </p>
              <ul className="learn-check-list">
                <li>
                  <FiCheckCircle aria-hidden />
                  מבצעים משתנים, דפי נחיתה וקמפיינים שיווקיים
                </li>
                <li>
                  <FiCheckCircle aria-hidden />
                  עדכון יעד ומדידת ביצועים בלי להדפיס מחדש
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section className="learn-block learn-block--split">
          <article className="learn-info-card">
            <span className="learn-section-kicker">למה זה עובד טוב</span>
            <h2>מה QR נותן לעסק?</h2>
            <ul className="learn-check-list">
              {benefits.map((item) => (
                <li key={item}>
                  <FiCheckCircle aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="learn-info-card">
            <span className="learn-section-kicker">בחירה חכמה</span>
            <h2>איך לבחור נכון?</h2>
            <ul className="learn-check-list">
              {tips.map((item) => (
                <li key={item}>
                  <FiCheckCircle aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="learn-summary-card">
          <div>
            <span className="learn-section-kicker">לסיכום</span>
            <h2>QR טוב הוא לא רק יפה. הוא גם ברור, מהיר וקל לסריקה.</h2>
            <p>
              כשמגדירים מטרה אחת ברורה, בוחרים בין סטטי לדינמי בצורה נכונה
              ומשאירים מעבר פשוט למשתמש, ה־QR הופך מכלי טכני לכלי שיווקי אמיתי.
            </p>
          </div>

          <div className="learn-summary-actions">
            <Link
              to="/create"
              className="dashboard-create-layered text-decoration-none"
            >
              להתחיל ליצור QR
            </Link>
            <span className="learn-summary-link">
              מעבר מהיר למחולל
              <FiArrowLeft aria-hidden />
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LearnQrPage;
