import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BRAND_GENERATOR_NAV_HE,
  BRAND_NAME,
  BRAND_TAGLINE_HE,
} from "../constants/brand";
import { API_BASE } from "../config";

function SiteFooter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        if (mounted) {
          setIsAuthenticated(response.ok);
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const authLinkClass = isAuthenticated
    ? "footer-link-disabled"
    : undefined;
  const authLinkProps = isAuthenticated
    ? {
        "aria-disabled": true,
        tabIndex: -1,
        onClick: (event) => event.preventDefault(),
      }
    : {};

  return (
    <footer className="site-footer mt-5" dir="rtl">
      <div className="container py-4">
        <div className="row g-4 g-lg-5 justify-content-center footer-grid">
          <div className="col-12 col-md-4 footer-col">
            <h6 className="footer-title">{BRAND_NAME}</h6>
            <p className="footer-text mb-2">{BRAND_TAGLINE_HE}</p>
            <p className="footer-text mb-0">
              מהיר, מאובטח ונוח לשימוש — עם התאמה אישית מלאה והורדה מיידית.
            </p>
          </div>

          <div className="col-12 col-md-4 footer-col">
            <h6 className="footer-title">ניווט מהיר</h6>
            <ul className="footer-links list-unstyled mb-0">
              <li>
                <Link to="/create">{BRAND_GENERATOR_NAV_HE}</Link>
              </li>
              <li>
                <Link to="/learn-qr">מה זה QR?</Link>
              </li>
              <li>
                <Link to="/login" className={authLinkClass} {...authLinkProps}>
                  התחברות
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={authLinkClass}
                  {...authLinkProps}
                >
                  הרשמה
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-4 footer-col">
            <h6 className="footer-title">מידע ותמיכה</h6>
            <ul className="footer-links list-unstyled mb-0">
              <li>
                <span className="footer-muted">שירות יציב וזמין</span>
              </li>
              <li>
                <span className="footer-muted">
                  שמירת QR אחרונים לחשבון שלך
                </span>
              </li>
              <li>
                <Link to="/contact">צור קשר</Link>
              </li>
              <li>
                <Link to="/privacy-terms">מדיניות פרטיות ותנאי שימוש</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom mt-4 pt-3">
          All rights reserved · 2026 · menmen770 ©
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
