import { useCallback, useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { API_BASE } from "../config";

/**
 * מסך עדכון פרטים באזור התוכן הראשי של הדשבורד.
 * שם וסיסמה — שני טפסים נפרדים; אפשר לעדכן רק אחד מהם.
 * אחרי שמירה מוצלחת או בלחיצה על «חזרה לקודים» — onClose.
 */
export default function DashboardAccountPanel({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [initialFullName, setInitialFullName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const loadMe = useCallback(async () => {
    setLoading(true);
    setProfileMsg({ type: "", text: "" });
    setPasswordMsg({ type: "", text: "" });
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      const u = data?.user;
      if (!u) return;
      const name = String(u.fullName || "").trim();
      setInitialFullName(name);
      setFullName(name);
      setEmail(String(u.email || ""));
      setHasPassword(Boolean(u.hasPassword));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setProfileMsg({ type: "danger", text: "שם מלא חייב להכיל לפחות שני תווים" });
      return;
    }
    if (trimmed === initialFullName) {
      setProfileMsg({ type: "danger", text: "לא שינית את השם — אין מה לשמור" });
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProfileMsg({
          type: "danger",
          text: data?.error || "שמירת הפרופיל נכשלה",
        });
        return;
      }
      const u = data?.user;
      if (u) {
        const name = String(u.fullName || "").trim();
        setInitialFullName(name);
        setFullName(name);
        setHasPassword(Boolean(u.hasPassword));
      }
      window.dispatchEvent(new Event("user-profile-updated"));
      onClose();
    } catch {
      setProfileMsg({ type: "danger", text: "שגיאת רשת" });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });
    if (!newPassword || newPassword.length < 7) {
      setPasswordMsg({
        type: "danger",
        text: "הסיסמה החדשה חייבת לכלול לפחות 7 תווים",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "danger", text: "הסיסמה החדשה והאימות אינם תואמים" });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/password`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordMsg({
          type: "danger",
          text: data?.error || "עדכון הסיסמה נכשל",
        });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch {
      setPasswordMsg({ type: "danger", text: "שגיאת רשת" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div
      className="card shadow-sm border-0 dashboard-account-full-card"
      dir="rtl"
    >
      <div className="card-body p-4 p-md-5">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
          <div>
            <h2 className="h4 fw-bold mb-1">עדכון פרטים</h2>
            <p className="text-muted small mb-0">
              אפשר לעדכן רק את השם או רק את הסיסמה — כל שמירה נפרדת.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary rounded-3 fw-semibold"
            onClick={onClose}
          >
            חזרה לקודים השמורים
          </button>
        </div>

        {loading ? (
          <p className="text-muted mb-0">טוען פרטי חשבון…</p>
        ) : (
          <div className="dashboard-account-full-grid">
            <section className="dashboard-account-full-section">
              <h3 className="h6 fw-bold text-secondary text-uppercase small mb-3">
                שם מלא
              </h3>
              <form onSubmit={saveProfile}>
                <label className="dashboard-account-label small fw-semibold text-secondary d-block mb-1">
                  שם להצגה
                </label>
                <div className="dashboard-search-shell mb-2">
                  <FiUser className="dashboard-search-icon" aria-hidden />
                  <input
                    type="text"
                    className="form-control dashboard-search-input"
                    autoComplete="name"
                    value={fullName}
                    onChange={(ev) => setFullName(ev.target.value)}
                    maxLength={120}
                  />
                </div>
                {email ? (
                  <p className="small text-muted mb-2">
                    אימייל:{" "}
                    <span className="user-select-all">{email}</span>
                  </p>
                ) : null}
                {profileMsg.text ? (
                  <p
                    className={`small mb-2 ${
                      profileMsg.type === "danger"
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    {profileMsg.text}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="btn dashboard-account-save-btn rounded-3 fw-semibold px-4"
                  disabled={savingProfile}
                >
                  {savingProfile ? "שומר…" : "שמור שם"}
                </button>
              </form>
            </section>

            {hasPassword ? (
              <section className="dashboard-account-full-section">
                <h3 className="h6 fw-bold text-secondary text-uppercase small mb-3">
                  סיסמה
                </h3>
                <form onSubmit={savePassword}>
                  <label className="dashboard-account-label small fw-semibold text-secondary d-block mb-1">
                    סיסמה נוכחית
                  </label>
                  <div className="dashboard-search-shell dashboard-search-shell--password mb-2">
                    <FiLock className="dashboard-search-icon" aria-hidden />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="form-control dashboard-search-input dashboard-search-input--password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(ev) => setCurrentPassword(ev.target.value)}
                    />
                    <button
                      type="button"
                      className="dashboard-password-visibility-toggle"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      aria-label={showCurrentPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                      aria-pressed={showCurrentPassword}
                    >
                      {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <label className="dashboard-account-label small fw-semibold text-secondary d-block mb-1">
                    סיסמה חדשה
                  </label>
                  <div className="dashboard-search-shell dashboard-search-shell--password mb-2">
                    <FiLock className="dashboard-search-icon" aria-hidden />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control dashboard-search-input dashboard-search-input--password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(ev) => setNewPassword(ev.target.value)}
                    />
                    <button
                      type="button"
                      className="dashboard-password-visibility-toggle"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      aria-label={showNewPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                      aria-pressed={showNewPassword}
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <label className="dashboard-account-label small fw-semibold text-secondary d-block mb-1">
                    אימות סיסמה חדשה
                  </label>
                  <div className="dashboard-search-shell dashboard-search-shell--password mb-2">
                    <FiLock className="dashboard-search-icon" aria-hidden />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control dashboard-search-input dashboard-search-input--password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(ev) => setConfirmPassword(ev.target.value)}
                    />
                    <button
                      type="button"
                      className="dashboard-password-visibility-toggle"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {passwordMsg.text ? (
                    <p
                      className={`small mb-2 ${
                        passwordMsg.type === "danger"
                          ? "text-danger"
                          : "text-success"
                      }`}
                    >
                      {passwordMsg.text}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    className="btn dashboard-account-save-btn rounded-3 fw-semibold px-4"
                    disabled={savingPassword}
                  >
                    {savingPassword ? "מעדכן…" : "עדכן סיסמה"}
                  </button>
                </form>
              </section>
            ) : (
              <section className="dashboard-account-full-section">
                <h3 className="h6 fw-bold text-secondary text-uppercase small mb-2">
                  סיסמה
                </h3>
                <p className="small text-muted mb-0">
                  התחברות עם גוגל/פייסבוק — אין סיסמה מקומית לעדכן כאן.
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
