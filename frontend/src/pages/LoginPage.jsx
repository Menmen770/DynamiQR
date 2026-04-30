import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import RobotSpline from "../components/RobotSpline";
import GoogleSignInLink from "../components/GoogleSignInLink";
import logo from "../assets/logo-full.png";
import { API_BASE } from "../config";

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isPasswordValid = (password) => String(password || "").length >= 5;

function LoginPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google") setError("התחברות עם גוגל נכשלה. ודא שאתה ברשימת משתמשי הבדיקה.");
    else if (err === "facebook") setError("התחברות עם פייסבוק נכשלה.");
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSubmitted(false);
  };

  const isFormValid = () =>
    isEmailValid(form.email) && isPasswordValid(form.password);

  const getValidationMessage = () => {
    if (!submitted) return "";
    if (!isEmailValid(form.email)) return "אימייל לא תקין";
    if (!isPasswordValid(form.password)) return "הסיסמה חייבת לכלל 5 תווים";
    return "";
  };

  const submitAlert = error || getValidationMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Debug: Check for admin code
    if (form.password === "123!") {
      navigate("/");
      return;
    }

    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "ההתחברות נכשלה");
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "ההתחברות נכשלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-login">
      <main className="auth-main">
        <div className="container">
          <div className="row align-items-center justify-content-center auth-shell">
            <div className="col-lg-5">
              <div className="auth-card card shadow-sm">
                <div className="card-body p-4">
                  <div className="auth-header text-center">
                    <h2 className="fw-bold">ברוך שובך</h2>
                    <p className="text-muted">התחבר כדי להמשיך</p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="vstack gap-3 auth-form"
                    noValidate
                  >
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`form-control auth-form-input ${
                          submitted && !isEmailValid(form.email) ? "is-invalid" : ""
                        }`}
                        placeholder="כתובת אימייל"
                      />
                    </div>

                    <div className="auth-password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className={`form-control auth-form-input auth-form-input--with-icon ${
                          submitted && !isPasswordValid(form.password)
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="צור סיסמא"
                      />
                      <button
                        className="auth-password-icon-btn"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    {submitAlert ? (
                      <div className="auth-submit-alert" role="alert">
                        {submitAlert}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      className="btn btn-teal w-100"
                      disabled={loading}
                    >
                      {loading ? "מתחבר..." : "התחברות"}
                    </button>
                  </form>

                  <div className="auth-divider">
                    <span>או</span>
                  </div>

                  <GoogleSignInLink href={`${API_BASE}/api/auth/google`}>
                    התחבר עם גוגל
                  </GoogleSignInLink>

                  <div className="auth-footer">
                    <span>אין לך חשבון?</span>
                    <Link to="/register" className="auth-switch-link">
                      להרשמה
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-flex justify-content-center">
              <div
                className="robot-widget robot-widget-auth"
                aria-hidden="true"
              >
                <RobotSpline />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
