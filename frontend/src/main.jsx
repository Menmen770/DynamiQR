import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";
import App from "./App.jsx";
import { API_BASE } from "./config";
import { getAuthToken, setAuthToken } from "./utils/authSession";

document.documentElement.lang = "he";
document.documentElement.dir = "rtl";

/** OAuth (Google/Facebook) returns here with JWT in hash — must run before first /auth/me. */
if (typeof window !== "undefined") {
  const { hash } = window.location;
  const prefix = "#access_token=";
  if (hash.startsWith(prefix)) {
    try {
      const token = decodeURIComponent(hash.slice(prefix.length));
      if (token) setAuthToken(token);
    } catch {
      /* ignore malformed hash */
    }
    window.history.replaceState(
      null,
      document.title,
      window.location.pathname + window.location.search,
    );
  }
}

if (typeof window !== "undefined" && typeof window.fetch === "function") {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const requestUrl =
      input instanceof Request
        ? input.url
        : input instanceof URL
          ? input.toString()
          : String(input || "");
    const token = getAuthToken();
    if (!token || !requestUrl.startsWith(API_BASE)) {
      return nativeFetch(input, init);
    }
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    if (init && init.headers) {
      const extra = new Headers(init.headers);
      extra.forEach((value, key) => headers.set(key, value));
    }
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return nativeFetch(input, {
      ...(init || {}),
      headers,
    });
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>,
);
