import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import logo from "../assets/logo-full.png";
import {
  BRAND_GENERATOR_NAV_HE,
  BRAND_NAME,
} from "../constants/brand";
import { API_BASE } from "../config";
import { clearAuthToken } from "../utils/authSession";

const MAIN_NAV_LINKS = [
  { to: "/", label: "קודים שמורים" },
  { to: "/create", label: BRAND_GENERATOR_NAV_HE },
  { to: "/learn-qr", label: "מה זה QR" },
];

const getGreetingByHour = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "בוקר טוב";
  if (hour >= 12 && hour < 17) return "צהריים טובים";
  if (hour >= 17 && hour < 21) return "ערב טוב";
  return "לילה טוב";
};

const getFirstName = (fullName) => {
  const normalized = String(fullName || "").trim();
  if (!normalized) return "";
  return normalized.split(/\s+/)[0] || "";
};

function MainNavbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });

        if (mounted) {
          setIsAuthenticated(response.ok);
          if (response.ok) {
            const data = await response.json();
            const currentUser = data?.user || null;
            setUser(currentUser);
          } else {
            setUser(null);
          }
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        if (!response.ok) return;
        const data = await response.json();
        setUser(data?.user || null);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("user-profile-updated", refreshUser);
    return () =>
      window.removeEventListener("user-profile-updated", refreshUser);
  }, []);

  useEffect(() => {
    const handleOutside = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuthToken();
      setIsAuthenticated(false);
      setUser(null);
      setIsMenuOpen(false);
      navigate("/login", { replace: true });
    }
  };

  const firstName = getFirstName(user?.fullName) || "User";
  const userInitial = firstName
    ? firstName.trim().charAt(0).toUpperCase()
    : "U";
  const greeting = getGreetingByHour();
  const showCenteredNav = !checkingAuth && isAuthenticated;

  return (
    <header className="navbar navbar-expand-lg bg-white border-bottom sticky-top shadow-sm">
      <div
        className={`container py-2 ${showCenteredNav ? "main-navbar-layout main-navbar-layout--auth" : "d-flex justify-content-between align-items-center flex-wrap gap-2"}`}
      >
        <button
          className="navbar-brand d-flex align-items-center m-0"
          type="button"
          onClick={() => navigate("/")}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: 0,
          }}
          title="חזרה לעמוד הבית"
        >
          <img src={logo} alt={BRAND_NAME} className="brand-logo" />
        </button>

        {showCenteredNav && (
          <nav className="main-navbar-center-nav" aria-label="ניווט ראשי">
            {MAIN_NAV_LINKS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`main-navbar-center-link ${isActive ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {checkingAuth ? null : isAuthenticated ? (
          <div className="navbar-user-area" ref={menuRef}>
            <button
              className="navbar-user-trigger"
              title={firstName}
              onClick={() => {
                setIsMenuOpen((prev) => !prev);
              }}
            >
              <span className="navbar-user-avatar">{userInitial}</span>
              <span className="navbar-user-text">
                <span className="navbar-user-greeting">{greeting}</span>
                <span className="navbar-user-name">{firstName}</span>
              </span>
            </button>

            <div
              className={`navbar-logout-flyout ${isMenuOpen ? "is-open" : ""}`}
              dir="rtl"
              aria-hidden={!isMenuOpen}
            >
              <button
                type="button"
                className="btn btn-logout-clean btn-sm navbar-logout-flyout-btn"
                onClick={handleLogout}
                tabIndex={isMenuOpen ? 0 : -1}
              >
                <FiLogOut className="me-1" aria-hidden />
                התנתקות
              </button>
            </div>
          </div>
        ) : (
          <div className="d-flex gap-2">
            <Link className="btn btn-outline-secondary btn-sm" to="/login">
              התחברות
            </Link>
            <Link className="btn btn-teal btn-sm" to="/register">
              הרשמה
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default MainNavbar;
