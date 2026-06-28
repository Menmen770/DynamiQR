import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "../config";
import { setAuthToken } from "../utils/authSession";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleCodeChange = (e) => {
    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
    setError("");
    setSuccess("");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("חסר אימייל — חזור להרשמה");
      return;
    }
    if (code.length !== 6) {
      setError("הזן קוד בן 6 ספרות");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "אימות נכשל");
      }
      if (data?.token) {
        setAuthToken(data.token);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "אימות נכשל");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "שליחה מחדש נכשלה");
      }
      setSuccess(data.message || "קוד חדש נשלח לאימייל");
      setCode("");
    } catch (err) {
      setError(err.message || "שליחה מחדש נכשלה");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page auth-register">
      <main className="auth-main">
        <div className="container">
          <div className="row align-items-center justify-content-center auth-shell">
            <div className="col-lg-5">
              <div className="auth-card card shadow-sm">
                <div className="card-body p-4">
                  <div className="auth-header text-center">
                    <h2 className="fw-bold">אימות אימייל</h2>
                    <p className="text-muted small mt-2 mb-0">
                      שלחנו קוד בן 6 ספרות לכתובת שלך
                    </p>
                  </div>

                  <div className="alert alert-light border text-end mb-3" dir="rtl">
                    <div className="small text-muted">נשלח אל:</div>
                    <strong dir="ltr">{email || "—"}</strong>
                  </div>

                  <form onSubmit={handleVerify} className="vstack gap-3 auth-form" noValidate>
                    <div>
                      <label className="form-label text-end w-100">קוד אימות</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={code}
                        onChange={handleCodeChange}
                        className="form-control auth-form-input text-center fs-3 fw-bold"
                        placeholder="000000"
                        maxLength={6}
                        dir="ltr"
                        style={{ letterSpacing: "0.35em" }}
                      />
                    </div>

                    {error ? (
                      <div className="auth-submit-alert" role="alert">
                        {error}
                      </div>
                    ) : null}

                    {success ? (
                      <div className="auth-submit-alert text-success" role="status">
                        {success}
                      </div>
                    ) : null}

                    <button type="submit" className="btn btn-teal w-100" disabled={loading}>
                      {loading ? "מאמת..." : "אמת והמשך"}
                    </button>
                  </form>

                  <button
                    type="button"
                    className="btn btn-link w-100 mt-2"
                    onClick={handleResend}
                    disabled={resending || !email}
                  >
                    {resending ? "שולח..." : "שלח קוד מחדש"}
                  </button>

                  <div className="auth-footer mt-3">
                    <span>טעית באימייל?</span>
                    <Link to="/register" className="auth-switch-link">
                      חזרה להרשמה
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VerifyEmailPage;
